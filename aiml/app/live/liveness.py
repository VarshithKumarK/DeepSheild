import numpy as np
from typing import List, Dict, Any, Optional

# MediaPipe Face Mesh landmark indices for Eye Aspect Ratio (EAR)
LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380]

# Key facial landmark indices for head pose tracking and stability checking
NOSE_TIP = 1
LEFT_BOUNDARY = 234
RIGHT_BOUNDARY = 454
FOREHEAD_TOP = 10
CHIN_BOTTOM = 152

def calculate_ear(landmarks, indices: List[int], width: int, height: int) -> float:
    """
    Calculate the Eye Aspect Ratio (EAR) for a single eye.
    
    Formula:
        EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
    """
    try:
        # Convert landmarks to pixel coordinates
        pts = [np.array([landmarks[idx].x * width, landmarks[idx].y * height]) for idx in indices]
        
        # Vertical distances
        d_v1 = np.linalg.norm(pts[1] - pts[5])
        d_v2 = np.linalg.norm(pts[2] - pts[4])
        
        # Horizontal distance
        d_h = np.linalg.norm(pts[0] - pts[3])
        
        if d_h == 0:
            return 0.0
            
        return (d_v1 + d_v2) / (2.0 * d_h)
    except Exception as e:
        print(f"Error calculating EAR: {e}")
        return 0.0

def calculate_head_pose(landmarks) -> Dict[str, float]:
    """
    Calculate head orientation ratios based on relative distances of the nose tip
    to the face boundaries (left, right, top, bottom).
    
    This is extremely lightweight and does not require complex camera calibration.
    """
    try:
        p_nose = np.array([landmarks[NOSE_TIP].x, landmarks[NOSE_TIP].y])
        p_left = np.array([landmarks[LEFT_BOUNDARY].x, landmarks[LEFT_BOUNDARY].y])
        p_right = np.array([landmarks[RIGHT_BOUNDARY].x, landmarks[RIGHT_BOUNDARY].y])
        p_top = np.array([landmarks[FOREHEAD_TOP].x, landmarks[FOREHEAD_TOP].y])
        p_bottom = np.array([landmarks[CHIN_BOTTOM].x, landmarks[CHIN_BOTTOM].y])
        
        d_left = np.linalg.norm(p_nose - p_left)
        d_right = np.linalg.norm(p_nose - p_right)
        d_top = np.linalg.norm(p_nose - p_top)
        d_bottom = np.linalg.norm(p_nose - p_bottom)
        
        yaw_ratio = d_left / d_right if d_right > 0 else 1.0
        pitch_ratio = d_top / d_bottom if d_bottom > 0 else 1.0
        
        return {
            "yaw_ratio": float(yaw_ratio),
            "pitch_ratio": float(pitch_ratio),
            "d_left": float(d_left),
            "d_right": float(d_right)
        }
    except Exception as e:
        print(f"Error calculating head pose: {e}")
        return {"yaw_ratio": 1.0, "pitch_ratio": 1.0}

def evaluate_liveness(
    landmarks,
    width: int,
    height: int,
    session_state: Dict[str, Any],
    requested_action: str,
    is_meeting_app: bool = False,
    is_screen_share: bool = False
) -> Dict[str, Any]:
    """
    Perform liveness checks for the current frame given the session state and target action.
    
    Steps:
    1. Calculate eye aspect ratios.
    2. Check for blink transitions.
    3. Check head pose ratio changes.
    4. Perform static image/spoof variance checks.
    """
    # 1. Calculate EAR
    left_ear = calculate_ear(landmarks, LEFT_EYE_INDICES, width, height)
    right_ear = calculate_ear(landmarks, RIGHT_EYE_INDICES, width, height)
    avg_ear = (left_ear + right_ear) / 2.0
    
    # 2. Get head pose
    pose = calculate_head_pose(landmarks)
    yaw = pose["yaw_ratio"]
    pitch = pose["pitch_ratio"]
    
    # Initialize session tracking keys if not present
    if "ear_history" not in session_state:
        session_state["ear_history"] = []
    if "landmark_history" not in session_state:
        session_state["landmark_history"] = []
    if "blink_verified" not in session_state:
        session_state["blink_verified"] = False
    if "left_turn_verified" not in session_state:
        session_state["left_turn_verified"] = False
    if "right_turn_verified" not in session_state:
        session_state["right_turn_verified"] = False
    if "blink_state" not in session_state:
        session_state["blink_state"] = {"closed": False, "opened": False}
        
    # Append to EAR history
    session_state["ear_history"].append(avg_ear)
    if len(session_state["ear_history"]) > 10:
        session_state["ear_history"].pop(0)
        
    # Track landmark history (save coords of nose tip and eye corners to detect static photos)
    curr_landmarks = [
        [landmarks[NOSE_TIP].x, landmarks[NOSE_TIP].y],
        [landmarks[LEFT_BOUNDARY].x, landmarks[LEFT_BOUNDARY].y],
        [landmarks[RIGHT_BOUNDARY].x, landmarks[RIGHT_BOUNDARY].y]
    ]
    session_state["landmark_history"].append(curr_landmarks)
    if len(session_state["landmark_history"]) > 5:
        session_state["landmark_history"].pop(0)
        
    # Static image spoof detection (variance of landmarks)
    is_static = False
    should_check_static = (not is_screen_share) or is_meeting_app
    
    if should_check_static and len(session_state["landmark_history"]) >= 3:
        history_arr = np.array(session_state["landmark_history"]) # shape (N, 3, 2)
        # Compute standard deviation over the N frames for each coordinate
        stds = np.std(history_arr, axis=0) # shape (3, 2)
        mean_std = np.mean(stds)
        # If mean std is extremely low, the user is not moving at all (likely static photo)
        if mean_std < 0.0005:  # threshold for micro-movements
            is_static = True

    # 3. Action-based verification logic
    blink_detected = False
    action_completed = False
    
    if requested_action == "blink":
        # Blink is verified by seeing the eye close (EAR < 0.20) and open (EAR > 0.24)
        if avg_ear < 0.20:
            session_state["blink_state"]["closed"] = True
        if avg_ear > 0.24:
            session_state["blink_state"]["opened"] = True
            
        if session_state["blink_state"]["closed"] and session_state["blink_state"]["opened"]:
            session_state["blink_verified"] = True
            blink_detected = True
            action_completed = True
            
    elif requested_action == "turn_left":
        # Turning left means nose moves left -> yaw_ratio (d_left / d_right) decreases significantly
        if yaw < 0.65:
            session_state["left_turn_verified"] = True
            action_completed = True
            
    elif requested_action == "turn_right":
        # Turning right means nose moves right -> yaw_ratio increases significantly
        if yaw > 1.55:
            session_state["right_turn_verified"] = True
            action_completed = True
            
    # Calculate a live liveness score based on current criteria
    # Default score starts at 0.5 and builds up with verified action completions
    liveness_score = 0.5
    
    # Face presence stability deduction
    if is_static:
        liveness_score -= 0.4
        
    # Penalize extreme EAR anomalies (e.g. eyes closed forever or EAR exactly zero)
    if avg_ear < 0.05:
        liveness_score -= 0.3
        
    # Add bonus for verified steps
    verified_steps_count = sum([
        1 if session_state["blink_verified"] else 0,
        1 if session_state["left_turn_verified"] else 0,
        1 if session_state["right_turn_verified"] else 0
    ])
    liveness_score += (verified_steps_count * 0.15)
    
    # Cap liveness score between 0.0 and 1.0
    liveness_score = max(0.0, min(1.0, liveness_score))
    
    return {
        "blink_detected": blink_detected,
        "blink_verified": session_state["blink_verified"],
        "left_turn_verified": session_state["left_turn_verified"],
        "right_turn_verified": session_state["right_turn_verified"],
        "is_static_spoof": is_static,
        "liveness_score": float(liveness_score),
        "action_completed": action_completed,
        "ear": float(avg_ear),
        "yaw": float(yaw),
        "pitch": float(pitch)
    }
