import torch
import cv2
import numpy as np
from torchvision import transforms
from app.utils.gradcam import generate_heatmap

# Standard ImageNet normalization for PyTorch models
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def predict(model, face):
    model = model.float()

    # 1. Fix OpenCV CV_64F (float64) depth error
    # OpenCV's cvtColor does not support float64. We must convert it to uint8.
    if face.dtype != np.uint8:
        # Check if the image was normalized to [0, 1]
        if face.max() <= 2.0:
            face = face * 255.0
        # Clip to [0, 255] to prevent overflow when casting
        face = np.clip(face, 0, 255).astype(np.uint8)

    # 2. Convert BGR -> RGB and resize to (224, 224)
    face_rgb = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
    face_resized = cv2.resize(face_rgb, (224, 224))

    # 3. Create 0-1 float32 image specifically for Grad-CAM overlay
    face_for_cam = face_resized.astype(np.float32) / 255.0

    # 4. Prepare normalized float32 tensor for model prediction
    tensor = transform(face_resized).unsqueeze(0).float()

    # 5. Extract prediction properly
    with torch.no_grad():
        output = model(tensor)
        prob = torch.sigmoid(output).item()

    label = "fake" if prob > 0.5 else "real"

    # 6. Generate Grad-CAM visualization
    heatmap = generate_heatmap(model, tensor, face_for_cam)

    # 7. Convert visualization from RGB back to BGR for cv2 saving
    heatmap_bgr = cv2.cvtColor(heatmap, cv2.COLOR_RGB2BGR)
    cv2.imwrite("final_overlay.jpg", heatmap_bgr)

    return label, prob, heatmap
