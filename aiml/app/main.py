from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import numpy as np
import cv2
from app.model.model import load_model
from app.model.preprocess import extract_face
from app.model.predict import predict
import shutil
import os
import tempfile
from app.video.processor import process_video
from app.video.validator import validate_video
from app.utils.heatmap_analysis import analyze_heatmap
from app.agent.explainer import generate_dynamic_explanation

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

    label, prob, heatmap, signals = predict(model, face, run_gradcam=True)

    heatmap_info = {}
    heatmap_base64 = None
    if heatmap is not None:
        # Pass the numpy ndarray heatmap to analyze
        heatmap_info = analyze_heatmap(heatmap)
        
        # Encode heatmap for the frontend
        _, buffer = cv2.imencode(".jpg", heatmap)
        import base64
        heatmap_base64 = base64.b64encode(buffer).decode("utf-8")

    # Generate dynamic explanation using strict prompt
    explanation = generate_dynamic_explanation(label, float(prob), signals, heatmap_info)

    return {
        "label": label,
        "confidence": float(prob),
        "signals": signals,
        "heatmap_info": heatmap_info,
        "explanation": explanation,
        "heatmap": heatmap_base64  # preserve the image for frontend if needed
    }

@app.post("/predict-video")
async def predict_video(file: UploadFile = File(...), explain: bool = False):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_path = temp_file.name

    try:

        # Pre-flight Validation
        is_valid, err_msg = validate_video(temp_path)
        if not is_valid:
            return JSONResponse(
                status_code=400, 
                content={"status": "error", "message": err_msg}
            )

        result = process_video(temp_path, explain=explain)
        return result

    finally:
        # Clean up file after processing
        if os.path.exists(temp_path):
            os.remove(temp_path)