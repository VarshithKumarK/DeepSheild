import cv2
from mtcnn import MTCNN

detector = MTCNN()

def extract_face(image):
    img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    faces = detector.detect_faces(img)

    if len(faces) == 0:
        return None

    x, y, w, h = faces[0]['box']
    face = img[y:y+h, x:x+w]

    face = cv2.resize(face, (224, 224))
    face = face / 255.0

    return face