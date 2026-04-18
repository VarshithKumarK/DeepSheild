import torch
import numpy as np
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image


def generate_heatmap(model, input_tensor, original_image):

    # Ensure correct dtype
    input_tensor = input_tensor.float()
    model = model.float()

    target_layer = model.features[-1]

    cam = GradCAM(model=model, target_layers=[target_layer])

    grayscale_cam = cam(input_tensor=input_tensor)[0]

    visualization = show_cam_on_image(
        original_image,  # must be 0–1 image
        grayscale_cam,
        use_rgb=True,
        image_weight=0.6,
    )

    return visualization
