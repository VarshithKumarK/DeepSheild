import os
import torch
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

def load_model():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = efficientnet_b0(weights=None)
    model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, 1)

    # Resolve relative path correctly
    current_dir = os.path.dirname(__file__)
    weight_path = os.path.abspath(os.path.join(current_dir, "../../weights/best_model.pth"))

    model.load_state_dict(torch.load(weight_path, map_location=device))
    model.to(device)
    model.eval()

    return model