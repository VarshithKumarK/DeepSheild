import time
import cv2
import numpy as np
import base64
from typing import Dict, Any, Tuple, Optional
from app.live.face_utils import decode_base64_image
from app.live.mediapipe_utils import get_face_mesh
from app.live.liveness import evaluate_liveness
from app.live.trust_score import calculate_trust_score
from app.model.preprocess import extract_face
from app.model.predict import predict as run_deepfake_predict

# In-memory session store for tracking liveness state over consecutive frames
sessions = {}

def get_session_state(session_id: str) -> Dict[str, Any]:
    """
    Get or create in-memory liveness tracking state for a given session.
    Prunes expired sessions (older than 10 minutes) to prevent leaks.
    """
    now = time.time()
    
    # Pruning logic
    expired = [sid for sid, s in sessions.items() if now - s.get("last_seen", 0) > 600]
    for sid in expired:
        sessions.pop(sid, None)
        
    if session_id not in sessions:
        sessions[session_id] = {
            "created_at": now,
            "last_seen": now,
            "ear_history": [],
            "landmark_history": [],
            "blink_verified": False,
            "left_turn_verified": False,
            "right_turn_verified": False,
            "blink_state": {"closed": False, "opened": False}
        }
    else:
        sessions[session_id]["last_seen"] = now
        
    return sessions[session_id]

def reset_session(session_id: str):
    """Reset a liveness verification session."""
    sessions.pop(session_id, None)

def run_deepfake_detection(model, frame: np.ndarray, landmarks, run_gradcam: bool = False) -> Tuple[Optional[str], Optional[float], Optional[np.ndarray]]:
    """
    Crop the face using MediaPipe landmarks (extremely fast, zero CPU overhead)
    and run the existing DeepEfficientNet prediction.
    
    Returns:
        Tuple of (label, confidence, heatmap_array)
    """
    if landmarks is None:
        return None, None, None
        
    h, w = frame.shape[:2]
    xs = [lm.x for lm in landmarks]
    ys = [lm.y for lm in landmarks]
    
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    
    # Convert to pixel coordinates
    x = int(min_x * w)
    y = int(min_y * h)
    box_w = int((max_x - min_x) * w)
    box_h = int((max_y - min_y) * h)
    
    # Add padding to get a complete face region
    pad_x = int(box_w * 0.20)
    pad_y = int(box_h * 0.25)
    
    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(w, x + box_w + pad_x)
    y2 = min(h, y + box_h + pad_y)
    
    face = frame[y1:y2, x1:x2]
    if face.size == 0:
        return None, None, None
        
    if run_gradcam:
        # predict returns: label, confidence, heatmap, signals
        label, confidence, heatmap, _ = run_deepfake_predict(model, face, run_gradcam=True, explain=False)
        return label, confidence, heatmap
    else:
        # predict returns: label, confidence
        label, confidence = run_deepfake_predict(model, face, run_gradcam=False, explain=False)
        return label, confidence, None

def process_live_frame(
    model,
    frame_base64: str,
    session_id: str,
    action: str,
    is_meeting_app: bool = False,
    is_screen_share: bool = False
) -> Dict[str, Any]:
    """
    Process a single frame from the webcam feed for live verification.
    
    Args:
        model: Loaded PyTorch model
        frame_base64: Base64 image string from client
        session_id: Client-side tracking UUID
        action: Target action for liveness (e.g. 'blink', 'turn_left', 'turn_right', 'static')
        
    Returns:
        JSON verification payload.
    """
    # 1. Decode frame
    image = decode_base64_image(frame_base64)
    if image is None:
        return {"error": "Invalid base64 frame encoding"}
        
    height, width, _ = image.shape
    
    # 2. Get Face Mesh / Landmarks
    face_mesh = get_face_mesh()
    landmarks = face_mesh.extract_landmarks(image)
    
    if landmarks is None:
        return {
            "face_detected": False,
            "error": "No face detected in feed"
        }
        
    # Get session state
    session_state = get_session_state(session_id)
    
    # 3. Liveness Checks
    liveness_results = evaluate_liveness(
        landmarks=landmarks,
        width=width,
        height=height,
        session_state=session_state,
        requested_action=action,
        is_meeting_app=is_meeting_app,
        is_screen_share=is_screen_share
    )
    
    # 4. Deepfake Detection
    # Run deepfake model. To save latency during real-time 1fps checks,
    # we run without gradcam unless the final step is reached (or keep it False for live performance).
    # We will compute deepfake prediction on the current frame.
    deepfake_label, deepfake_confidence, heatmap_img = run_deepfake_detection(model, image, landmarks, run_gradcam=False)
    
    if deepfake_label is None:
        return {
            "face_detected": False,
            "error": "Liveness landmarks visible but crop extraction failed"
        }
        
    # 5. Generate Trust Score
    trust_results = calculate_trust_score(
        deepfake_label=deepfake_label,
        deepfake_confidence=deepfake_confidence,
        liveness_score=liveness_results["liveness_score"],
        is_static_spoof=liveness_results["is_static_spoof"],
        is_screen_share=is_screen_share
    )
    
    # Structure JSON Response
    response = {
        "face_detected": True,
        "session_id": session_id,
        "action_requested": action,
        "action_completed": liveness_results["action_completed"],
        "liveness": {
            "blink_detected": liveness_results["blink_detected"],
            "blink_verified": liveness_results["blink_verified"],
            "left_turn_verified": liveness_results["left_turn_verified"],
            "right_turn_verified": liveness_results["right_turn_verified"],
            "is_static_spoof": liveness_results["is_static_spoof"],
            "ear": liveness_results["ear"],
            "yaw": liveness_results["yaw"],
            "pitch": liveness_results["pitch"],
            "liveness_score": trust_results["liveness_score"]
        },
        "deepfake": {
            "label": deepfake_label,
            "confidence": deepfake_confidence,
            "authenticity_score": trust_results["deepfake_score"]
        },
        "trust": {
            "trust_score": trust_results["trust_score"],
            "trust_level": trust_results["trust_level"],
            "risk_indicator": trust_results["risk_indicator"]
        }
    }
    
    return response
