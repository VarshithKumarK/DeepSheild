import os
import cv2
import mediapipe as mp
import numpy as np

class MediaPipeFaceMesh:
    def __init__(self):
        """
        Initialize the new MediaPipe Tasks FaceLandmarker.
        Resolves the weights path and downloads the model automatically if missing.
        """
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Resolve path to aiml/weights/face_landmarker.task
        model_path = os.path.abspath(os.path.join(current_dir, "../../../weights/face_landmarker.task"))
        
        if not os.path.exists(model_path):
            print(f"Face landmarker model not found at {model_path}. Downloading...")
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            import urllib.request
            url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
            urllib.request.urlretrieve(url, model_path)
            print("Download completed successfully.")

        BaseOptions = mp.tasks.BaseOptions
        FaceLandmarker = mp.tasks.vision.FaceLandmarker
        FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
        VisionRunningMode = mp.tasks.vision.RunningMode

        options = FaceLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=model_path),
            running_mode=VisionRunningMode.IMAGE,
            num_faces=4
        )
        self.landmarker = FaceLandmarker.create_from_options(options)

    def extract_landmarks(self, image: np.ndarray):
        """
        Process a BGR image and return normalized landmarks.
        
        Args:
            image: BGR numpy array (OpenCV image)
            
        Returns:
            Normalized landmark coordinates list or None if no face is detected.
        """
        if image is None or image.size == 0:
            return None
        
        # Convert BGR (OpenCV) -> RGB (MediaPipe)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Convert numpy array to mp.Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)
        
        # Perform inference
        result = self.landmarker.detect(mp_image)
        
        if not result.face_landmarks:
            return None
            
        # Return first detected face's landmarks
        return result.face_landmarks[0]

    def extract_multi_landmarks(self, image: np.ndarray):
        """
        Process a BGR image and return normalized landmarks for all detected faces.
        
        Args:
            image: BGR numpy array (OpenCV image)
            
        Returns:
            List of normalized landmark coordinates or None if no face is detected.
        """
        if image is None or image.size == 0:
            return None
        
        # Convert BGR (OpenCV) -> RGB (MediaPipe)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Convert numpy array to mp.Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)
        
        # Perform inference
        result = self.landmarker.detect(mp_image)
        
        if not result.face_landmarks:
            return None
            
        return result.face_landmarks

# Singleton instance for the service
_face_mesh_instance = None

def get_face_mesh():
    global _face_mesh_instance
    if _face_mesh_instance is None:
        _face_mesh_instance = MediaPipeFaceMesh()
    return _face_mesh_instance
