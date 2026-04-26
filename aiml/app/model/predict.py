import torch
import cv2
import numpy as np
from PIL import Image
from torchvision import transforms
from app.utils.gradcam import generate_heatmap
from app.utils.signals import extract_signals

# MUST match the training transform exactly (ImageFolder uses PIL, Resize first, then ToTensor+Normalize)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def predict(model, face, run_gradcam=False, explain=False):
    """
    face: full BGR uint8 numpy image (same as what model was trained on via ImageFolder).
    The model was trained on full images — do NOT crop to face region before calling this.
    """
    device = next(model.parameters()).device
    model = model.float()

    # Convert BGR (OpenCV) -> RGB (PIL/PyTorch convention)
    face_rgb = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)

    # For Grad-CAM overlay: a 224x224 float32 [0,1] RGB image
    face_for_cam = cv2.resize(face_rgb, (224, 224)).astype(np.float32) / 255.0

    # Convert to PIL for the training-consistent transform pipeline
    pil_img = Image.fromarray(face_rgb)
    tensor = transform(pil_img).unsqueeze(0).float().to(device)

    # Run model
    with torch.no_grad():
        output = model(tensor)
        prob = torch.sigmoid(output).item()

    # class_to_idx: {'fake': 0, 'real': 1}
    # sigmoid > 0.5  =>  class 1  =>  real
    # sigmoid < 0.5  =>  class 0  =>  fake
    if prob >= 0.5:
        label = "real"
        confidence = prob
    else:
        label = "fake"
        confidence = 1.0 - prob

    if not run_gradcam and not explain:
        return label, confidence

    heatmap = None
    # Generate Grad-CAM heatmap if needed
    heatmap = generate_heatmap(model, tensor, face_for_cam)

    # Convert RGB heatmap -> BGR for cv2 saving
    heatmap_bgr = cv2.cvtColor(heatmap, cv2.COLOR_RGB2BGR)
    
    # Save relative to this file
    import os
    current_dir = os.path.dirname(__file__)
    overlay_path = os.path.abspath(os.path.join(current_dir, "../../final_overlay.jpg"))
    cv2.imwrite(overlay_path, heatmap_bgr)

    # Extract dynamic signals based on predictions and image characteristics
    signals = extract_signals(face, label, confidence, True)

    if explain:
        from app.utils.heatmap_analysis import analyze_heatmap
        from app.agent.explainer import generate_dynamic_explanation
        
        heatmap_info = analyze_heatmap(heatmap)
        explanation = generate_dynamic_explanation(label, float(confidence), signals, heatmap_info)
        
        return label, confidence, heatmap_info, signals, explanation

    return label, confidence, heatmap, signals
