import cv2

def validate_video(video_path: str):
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        return False, "Invalid or corrupted video file"
        
    try:
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
        height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
        
        if fps <= 0:
            return False, "Invalid or corrupted video file"
            
        duration = frame_count / fps
        
        if duration > 300.0:
            return False, "Video too long (max 5 minutes)"
            
        if width > 3840 or height > 2160:
            return False, "Resolution exceeds 4K limit"
            
        if fps > 60:
            return False, "FPS too high"
            
        return True, "Valid video"
    except Exception as e:
        return False, f"Error validating video: {str(e)}"
    finally:
        cap.release()
