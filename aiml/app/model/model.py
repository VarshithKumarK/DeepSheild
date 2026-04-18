import torch
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

def load_model():
    model = efficientnet_b0(weights=None)
    model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, 1)

    model.load_state_dict(torch.load("weights/best_model.pth", map_location="cpu"))
    model.eval()

    return model