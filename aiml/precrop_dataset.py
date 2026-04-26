"""
Pre-crops all training images using MTCNN and saves them to data/dataset_cropped.
Run this ONCE before training. Takes ~5-15 minutes.

Usage:
    .venv\Scripts\python.exe precrop_dataset.py
"""
import os
import cv2
from mtcnn import MTCNN
from tqdm import tqdm

def process_image(src_path, dst_path, detector):
    """
    Processes a single image.
    Returns status: 'skipped', 'cropped', 'fallback', or 'failed'
    """
    # 1. Skip if already processed
    if os.path.exists(dst_path):
        return 'skipped'

    # Load image
    img_bgr = cv2.imread(src_path)
    if img_bgr is None:
        return 'failed'
        
    # Convert BGR to RGB for MTCNN
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    
    try:
        faces = detector.detect_faces(img_rgb)
    except Exception:
        # Avoid crashes on corrupted images that cv2.imread didn't catch
        return 'failed'

    if faces:
        # Get bounding box
        x, y, w, h = faces[0]['box']
        
        # Robust bounding box handling
        img_h, img_w = img_bgr.shape[:2]
        
        # Handle safely negative coords and limits
        x1 = max(0, x)
        y1 = max(0, y)
        x2 = min(img_w, x + w)
        y2 = min(img_h, y + h)
        
        # Ensure valid crop area
        if x2 > x1 and y2 > y1:
            crop = img_bgr[y1:y2, x1:x2]
            if crop.size > 0:
                cv2.imwrite(dst_path, crop)
                return 'cropped'

    # 4. No valid face or no face detected — save full image as fallback
    cv2.imwrite(dst_path, img_bgr)
    return 'fallback'

def main():
    detector = MTCNN()

    SRC = "data/dataset"
    DST = "data/dataset_cropped"

    classes = ["fake", "real"]
    total_stats = {'cropped': 0, 'fallback': 0, 'skipped': 0, 'failed': 0}

    for class_name in classes:
        src_dir = os.path.join(SRC, class_name)
        dst_dir = os.path.join(DST, class_name)
        
        if not os.path.exists(src_dir):
            print(f"Directory not found: {src_dir}")
            continue
            
        os.makedirs(dst_dir, exist_ok=True)

        files = [f for f in os.listdir(src_dir) if f.lower().endswith((".jpg", ".jpeg", ".png"))]
        print(f"\n[{class_name}] Processing {len(files)} images...")

        class_stats = {'cropped': 0, 'fallback': 0, 'skipped': 0, 'failed': 0}

        # 7. Use tqdm for progress bar
        for fname in tqdm(files, desc=f"{class_name.capitalize()}"):
            src_path = os.path.join(src_dir, fname)
            dst_path = os.path.join(dst_dir, fname)
            
            status = process_image(src_path, dst_path, detector)
            class_stats[status] += 1
            total_stats[status] += 1
            
        print(f"  Class Summary — Cropped: {class_stats['cropped']}, Fallback: {class_stats['fallback']}, Skipped: {class_stats['skipped']}, Failed: {class_stats['failed']}")

    print("\nAll done!")
    print(f"Total Summary — Cropped: {total_stats['cropped']}, Fallback: {total_stats['fallback']}, Skipped: {total_stats['skipped']}, Failed: {total_stats['failed']}")
    print("Dataset ready at data/dataset_cropped/")
    print("Now run: python -m training.train")

if __name__ == "__main__":
    main()
