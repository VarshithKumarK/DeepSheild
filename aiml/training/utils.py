def calculate_accuracy(outputs, labels):
    preds = (outputs > 0).float()
    correct = (preds == labels).sum().item()
    return correct / len(labels)
