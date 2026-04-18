import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights


def get_model():
    model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, 1)
    return model
