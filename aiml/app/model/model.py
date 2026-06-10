import os
import torch
from torchvision.models import efficientnet_b0
from app.model.xception_swin import XceptionSwinHybrid

from functools import lru_cache

def load_model(model_type="efficientnet"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    current_dir = os.path.dirname(__file__)
    
    if model_type == "xception_swin":
        print("[AI Model Loader] Loading Xception + Swin Transformer Hybrid Architecture...")
        model = XceptionSwinHybrid(num_classes=1, pretrained=False)
        weight_path = os.path.abspath(os.path.join(current_dir, "../../weights/xception_swin_best.pth"))
    else:
        print("[AI Model Loader] Loading EfficientNet-B0 Architecture...")
        model = efficientnet_b0(weights=None)
        model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, 1)
        weight_path = os.path.abspath(os.path.join(current_dir, "../../weights/best_model.pth"))

    if os.path.exists(weight_path):
        print(f"[AI Model Loader] Loading model weights from: {weight_path}")
        model.load_state_dict(torch.load(weight_path, map_location=device))
    else:
        print(f"[AI Model Loader] WARNING: Model weights file not found at '{weight_path}'. Initializing model with default weights.")
        
    model.to(device)
    model.eval()

    return model

@lru_cache(maxsize=2)
def get_model(model_type="efficientnet"):
    """
    Retrieve model from in-memory cache to prevent reloading from disk on every request.
    """
    return load_model(model_type)