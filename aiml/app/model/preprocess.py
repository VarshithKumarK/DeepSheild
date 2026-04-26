import cv2
from mtcnn import MTCNN

detector = MTCNN()


def extract_face(image):
    """
    Detect and return the cropped face region (BGR) using MTCNN.
    Returns None if no face is detected.
    """
    if image is None or image.size == 0:
        return None

    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    faces = detector.detect_faces(img_rgb)

    if not faces:
        return None

    x, y, w, h = faces[0]['box']
    x, y = max(0, x), max(0, y)
    face_crop = image[y:y+h, x:x+w]

    if face_crop.size == 0:
        return None

    return face_crop