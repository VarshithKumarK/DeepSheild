import base64
import cv2
import numpy as np

def decode_base64_image(base64_str: str) -> np.ndarray:
    """
    Decode a base64 encoded image string (with or without data URI prefix)
    into an OpenCV BGR numpy array.
    """
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
            
        img_data = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return image
    except Exception as e:
        print(f"Error decoding base64 image: {e}")
        return None
