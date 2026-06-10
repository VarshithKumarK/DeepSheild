import os
import argparse
import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from sklearn.metrics import precision_score, recall_score, f1_score

from app.model.model import get_model
from training.config import Config

def evaluate(model_type="efficientnet", batch_size=32, max_samples=None):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[*] Evaluation Target Model: {model_type.upper()}")
    print(f"[*] Running on hardware device: {device}")
    
    # 1. Image Transforms (consistent with training pipeline)
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    data_dir = Config.DATA_DIR
    if not os.path.exists(data_dir):
        raise FileNotFoundError(f"Cropped dataset not found at '{data_dir}'. Please run precrop_dataset.py first.")
        
    dataset = datasets.ImageFolder(root=data_dir, transform=val_transform)
    
    if max_samples and max_samples < len(dataset):
        print(f"[*] Sub-sampling dataset to {max_samples} random images...")
        import random
        random.seed(42) # Seed for consistency
        indices = random.sample(range(len(dataset)), max_samples)
        dataset = torch.utils.data.Subset(dataset, indices)
        
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    
    print(f"[*] Loaded {len(dataset)} images for evaluation from '{data_dir}'")
    
    # 2. Load cached model instance
    try:
        model = get_model(model_type).to(device)
    except Exception as e:
        print(f"[!] Error loading model weights: {e}")
        print("[*] Proceeding with standard weight initialization...")
        from app.model.model import load_model
        model = load_model(model_type).to(device)
        
    model.eval()
    
    all_preds = []
    all_labels = []
    inference_times = []
    
    # 3. Evaluation Loop
    print("[*] Performing evaluation runs...")
    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            
            # Benchmark inference speed for this batch
            start_time = time.time()
            outputs = model(images)
            # Apply Sigmoid to match prediction logic
            probs = torch.sigmoid(outputs)
            batch_time = (time.time() - start_time) * 1000 # in milliseconds
            
            inference_times.append(batch_time / images.size(0))
            
            preds = (probs >= 0.5).float()
            all_preds.extend(preds.cpu().squeeze(-1).tolist())
            all_labels.extend(labels.tolist())
            
    # 4. Metrics Calculations
    all_preds = [int(p) for p in all_preds]
    all_labels = [int(l) for l in all_labels]
    
    # In dataset.class_to_idx: 'fake' -> 0, 'real' -> 1
    # For binary classification metrics (True/Positive corresponds to the flagged anomaly):
    # Let's map target class 'fake' (0) as the positive class, or standard 1.
    # To keep it standard: let's evaluate correctness directly:
    total = len(all_labels)
    correct = sum([p == l for p, l in zip(all_preds, all_labels)])
    accuracy = correct / total
    
    # Detailed counts for Confusion Matrix
    tp, fp, tn, fn = 0, 0, 0, 0
    # Map: Real (1) vs Fake (0)
    for p, l in zip(all_preds, all_labels):
        if p == 0 and l == 0:
            tp += 1 # correctly flagged fake
        elif p == 0 and l == 1:
            fp += 1 # real face falsely flagged as fake
        elif p == 1 and l == 1:
            tn += 1 # correctly identified real face
        elif p == 1 and l == 0:
            fn += 1 # fake face missed (falsely identified as real)
            
    # Calculate Precision, Recall, and F1 relative to finding 'fakes' (class 0)
    # Binary metrics relative to class 0: we flip the labels for sklearn metrics
    binary_preds = [1 - p for p in all_preds]
    binary_labels = [1 - l for l in all_labels]
    
    precision = precision_score(binary_labels, binary_preds, zero_division=0)
    recall = recall_score(binary_labels, binary_preds, zero_division=0)
    f1 = f1_score(binary_labels, binary_preds, zero_division=0)
    
    avg_latency = sum(inference_times) / len(inference_times)
    fps = 1000.0 / avg_latency
    
    # 5. Print Detailed Performance Report
    print("\n" + "="*50)
    print(f"      MODEL EVALUATION REPORT: {model_type.upper()}")
    print("="*50)
    print(f"Accuracy:          {accuracy:.4f} ({correct}/{total} correct)")
    print(f"Precision (Fake):  {precision:.4f} (proportion of flagged fakes that are indeed fake)")
    print(f"Recall (Fake):     {recall:.4f} (proportion of total fakes successfully detected)")
    print(f"F1-Score (Fake):   {f1:.4f}")
    print("-"*50)
    print("CONFUSION MATRIX DETAILS:")
    print(f"  - True Positives (Correctly Flagged Fakes): {tp}")
    print(f"  - False Positives (Real Flagged as Fake):  {fp}")
    print(f"  - True Negatives (Correctly Passed Reals):  {tn}")
    print(f"  - False Negatives (Missed Fake Faces):     {fn}")
    print("-"*50)
    print("SPEED & LATENCY BENCHMARKS:")
    print(f"  - Average Latency:  {avg_latency:.2f} ms per frame")
    print(f"  - Throughput:       {fps:.2f} Frames Per Second (FPS)")
    print("="*50 + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate DeepShield Deepfake Models")
    parser.add_argument("--model", type=str, choices=["efficientnet", "xception_swin"], default="efficientnet",
                        help="Model to evaluate (efficientnet or xception_swin)")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size for evaluation")
    parser.add_argument("--samples", type=int, default=None,
                        help="Maximum number of random samples to evaluate (default: evaluate all)")
    args = parser.parse_args()
    
    evaluate(model_type=args.model, batch_size=args.batch_size, max_samples=args.samples)
