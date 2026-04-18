import torch


class Config:
    DATA_DIR = "data/dataset"
    BATCH_SIZE = 32
    LR = 5e-5
    EPOCHS = 10
    IMAGE_SIZE = 224
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
