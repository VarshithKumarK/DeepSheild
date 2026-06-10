import os
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import precision_score, recall_score
from tqdm import tqdm

from training.dataset import get_dataloaders
from app.model.xception_swin import XceptionSwinHybrid
from training.config import Config

def train():
    print("[*] Loading pre-cropped data loaders...")
    train_loader, val_loader = get_dataloaders()

    print("[*] Initializing Xception + Swin Transformer Hybrid Model...")
    # Pretrained=True downloads initial ImageNet features for transfer learning
    model = XceptionSwinHybrid(num_classes=1, pretrained=True).to(Config.DEVICE)

    # Class imbalance weighting (fake: 960, real: 1081)
    pos_weight = torch.tensor([960 / 1081]).to(Config.DEVICE)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
    
    # AdamW is standard for self-attention layers
    optimizer = optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-2)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=Config.EPOCHS)

    best_acc = 0.0
    weights_dir = "weights"
    os.makedirs(weights_dir, exist_ok=True)
    save_path = os.path.join(weights_dir, "xception_swin_best.pth")

    print(f"[*] Starting training loop for {Config.EPOCHS} epochs...")
    for epoch in range(Config.EPOCHS):
        model.train()
        total_loss = 0.0

        pbar = tqdm(train_loader, desc=f"Epoch {epoch + 1}/{Config.EPOCHS} [Train]")
        for images, labels in pbar:
            images = images.to(Config.DEVICE)
            labels = labels.float().unsqueeze(1).to(Config.DEVICE)

            outputs = model(images)
            loss = criterion(outputs, labels)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            current_batch_loss = loss.item()
            total_loss += current_batch_loss * images.size(0)
            pbar.set_postfix(loss=f"{current_batch_loss:.4f}")

        scheduler.step()
        avg_loss = total_loss / len(train_loader.dataset)
        print(f"Train Loss: {avg_loss:.4f}")

        val_acc = validate(model, val_loader)
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), save_path)
            print(f"✅ Best Xception-Swin model checkpoint saved to: {save_path}")

    print("\n✅ Training Complete!")

def validate(model, val_loader):
    model.eval()

    all_preds = []
    all_labels = []

    with torch.no_grad():
        pbar = tqdm(val_loader, desc="[Validation]")
        for images, labels in pbar:
            images = images.to(Config.DEVICE)
            labels = labels.float().unsqueeze(1).to(Config.DEVICE)

            outputs = model(images)
            preds = (outputs > 0).float()

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    all_preds = [int(p[0]) for p in all_preds]
    all_labels = [int(l[0]) for l in all_labels]

    accuracy = sum([p == l for p, l in zip(all_preds, all_labels)]) / len(all_labels)
    precision = precision_score(all_labels, all_preds, zero_division=0)
    recall = recall_score(all_labels, all_preds, zero_division=0)

    print(f"Validation Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f} | Recall: {recall:.4f}")

    return accuracy

if __name__ == "__main__":
    train()
