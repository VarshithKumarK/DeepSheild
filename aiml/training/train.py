import torch
import torch.nn as nn
import torch.optim as optim

from training.dataset import get_dataloaders
from training.model import get_model
from training.config import Config
from training.utils import calculate_accuracy
from sklearn.metrics import precision_score, recall_score


def train():
    train_loader, val_loader = get_dataloaders()

    model = get_model().to(Config.DEVICE)

    # Slight class imbalance (fake: 960, real: 1081)
    pos_weight = torch.tensor([960 / 1081]).to(Config.DEVICE)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
    optimizer = optim.Adam(model.parameters(), lr=Config.LR)
    best_acc = 0
    for epoch in range(Config.EPOCHS):
        model.train()
        total_loss = 0

        for images, labels in train_loader:
            images = images.to(Config.DEVICE)
            labels = labels.float().unsqueeze(1).to(Config.DEVICE)

            outputs = model(images)
            loss = criterion(outputs, labels)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        print(f"Epoch {epoch + 1}, Loss: {total_loss:.4f}")

        val_acc = validate(model, val_loader)
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), "weights/best_model.pth")
            print("✅ Best model saved!")

    torch.save(model.state_dict(), "weights/efficientnet.pth")
    print("✅ Model saved!")


def validate(model, val_loader):
    model.eval()

    all_preds = []
    all_labels = []

    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(Config.DEVICE)
            labels = labels.float().unsqueeze(1).to(Config.DEVICE)

            outputs = model(images)

            preds = (outputs > 0).float()

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    # Convert to flat arrays
    all_preds = [int(p[0]) for p in all_preds]
    all_labels = [int(l[0]) for l in all_labels]

    accuracy = sum([p == l for p, l in zip(all_preds, all_labels)]) / len(all_labels)
    precision = precision_score(all_labels, all_preds)
    recall = recall_score(all_labels, all_preds)

    print(f"Validation Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}, Recall: {recall:.4f}")

    return accuracy


if __name__ == "__main__":
    train()
