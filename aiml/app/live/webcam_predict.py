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
    Process a single frame from the webcam feed or screen share for live verification.
    Supports single face or multi-face detection dynamically.
    """
    # 1. Decode frame
    image = decode_base64_image(frame_base64)
    if image is None:
        return {"error": "Invalid base64 frame encoding"}
        
    height, width, _ = image.shape
    
    # 2. Get Face Mesh / Landmarks (multiple faces)
    face_mesh = get_face_mesh()
    faces_landmarks = face_mesh.extract_multi_landmarks(image)
    
    if not faces_landmarks:
        return {
            "face_detected": False,
            "error": "No face detected in feed"
        }
        
    # Get session state
    session_state = get_session_state(session_id)
    
    # If not screen share, we only process the first face (Webcam KYC)
    if not is_screen_share:
        faces_landmarks = [faces_landmarks[0]]
        
    # Sort landmarks left-to-right for consistent tracking across frames
    faces_landmarks = sorted(faces_landmarks, key=lambda lm_list: sum(lm.x for lm in lm_list)/len(lm_list))
    
    faces_results = []
    
    for idx, landmarks in enumerate(faces_landmarks):
        # Retrieve or initialize tracking state for this face index
        face_state_key = f"face_{idx}"
        if face_state_key not in session_state:
            session_state[face_state_key] = {
                "ear_history": [],
                "landmark_history": [],
                "blink_verified": False,
                "left_turn_verified": False,
                "right_turn_verified": False,
                "blink_state": {"closed": False, "opened": False}
            }
        face_session_state = session_state[face_state_key]
        
        # 3. Liveness Checks
        liveness_results = evaluate_liveness(
            landmarks=landmarks,
            width=width,
            height=height,
            session_state=face_session_state,
            requested_action=action,
            is_meeting_app=is_meeting_app,
            is_screen_share=is_screen_share
        )
        
        # 4. Deepfake Detection
        deepfake_label, deepfake_confidence, _ = run_deepfake_detection(model, image, landmarks, run_gradcam=False)
        
        if deepfake_label is None:
            continue
            
        # 5. Generate Trust Score
        trust_results = calculate_trust_score(
            deepfake_label=deepfake_label,
            deepfake_confidence=deepfake_confidence,
            liveness_score=liveness_results["liveness_score"],
            is_static_spoof=liveness_results["is_static_spoof"],
            is_screen_share=is_screen_share
        )
        
        # Calculate bounding box (normalized coordinates)
        xs = [lm.x for lm in landmarks]
        ys = [lm.y for lm in landmarks]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        box_w = max_x - min_x
        box_h = max_y - min_y
        
        # Add padding to make the bounding box cover the whole face/head nicely on the frontend
        pad_x = box_w * 0.15
        pad_y = box_h * 0.20
        
        px1 = max(0.0, min_x - pad_x)
        py1 = max(0.0, min_y - pad_y)
        px2 = min(1.0, max_x + pad_x)
        py2 = min(1.0, max_y + pad_y)
        
        box = {
            "x": float(px1),
            "y": float(py1),
            "w": float(px2 - px1),
            "h": float(py2 - py1)
        }
        
        faces_results.append({
            "face_index": idx,
            "box": box,
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
        })
        
    if not faces_results:
        return {
            "face_detected": False,
            "error": "Face detection extraction failed for all faces"
        }
        
    # Aggregation for screen share to represent the worst-case (highest threat) face
    if is_screen_share and len(faces_results) > 1:
        worst_face = min(faces_results, key=lambda f: f["trust"]["trust_score"])
        response = {
            "face_detected": True,
            "session_id": session_id,
            "action_requested": action,
            "action_completed": False,
            "liveness": worst_face["liveness"],
            "deepfake": worst_face["deepfake"],
            "trust": worst_face["trust"],
            "faces": faces_results
        }
    else:
        primary_face = faces_results[0]
        response = {
            "face_detected": True,
            "session_id": session_id,
            "action_requested": action,
            "action_completed": primary_face["liveness"]["blink_verified"] or primary_face["liveness"]["left_turn_verified"] or primary_face["liveness"]["right_turn_verified"],
            "liveness": primary_face["liveness"],
            "deepfake": primary_face["deepfake"],
            "trust": primary_face["trust"],
            "faces": faces_results
        }
    
    return response
