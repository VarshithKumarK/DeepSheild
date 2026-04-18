from fastapi import FastAPI, UploadFile, File
import numpy as np
import cv2
from app.model.model import load_model
from app.model.preprocess import extract_face
from app.model.predict import predict

app = FastAPI()

model = load_model()


@app.get("/")
def home():
    return {"message": "DeepShield ML Service Running 🚀"}


@app.post("/predict")
async def predict_api(file: UploadFile = File(...)):
    contents = await file.read()

    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    face = extract_face(image)

    if face is None:
        return {"error": "No face detected"}

    label, prob, heatmap = predict(model, face)

    # Encode heatmap
    _, buffer = cv2.imencode(".jpg", heatmap)

    import base64

    heatmap_base64 = base64.b64encode(buffer).decode("utf-8")

    return {"label": label, "confidence": prob, "heatmap": heatmap_base64}
