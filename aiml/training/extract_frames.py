"""
extract_frames.py
-----------------
Extracts frames from raw videos (real/fake) and saves them into the
data/training/ dataset directory, compatible with PyTorch ImageFolder.

Run from:  DeepSheild/aiml/training/
    python extract_frames.py

Expected project layout (relative to DeepSheild/aiml/):
    raw_videos/
    ├── real/
    └── fake/

Output (appended — never overwrites existing files):
    data/training/
    ├── real/
    └── fake/
"""

import cv2
import os

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Paths are relative to DeepSheild/aiml/training/ → go up ONE level to aiml/
_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

RAW_VIDEO_ROOT     = os.path.join(_ROOT, "raw_videos")         # aiml/raw_videos/real  & aiml/raw_videos/fake
TRAINING_DATA_ROOT = os.path.join(_ROOT, "data", "training")   # aiml/data/training/real & aiml/data/training/fake

LABELS      = ["real", "fake"]   # Must match subfolder names
FRAME_SKIP  = 5                  # Extract every Nth frame  (0, 5, 10, …)
IMAGE_EXT   = ".jpg"             # Output image format


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def ensure_dir(path: str) -> None:
    """Create directory (and parents) if it does not already exist."""
    os.makedirs(path, exist_ok=True)


def get_video_paths(folder: str) -> list:
    """
    Return a sorted list of absolute paths to all video files inside *folder*.
    Supported extensions: .mp4, .avi, .mov, .mkv, .webm
    """
    supported = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
    paths = []
    for fname in os.listdir(folder):
        ext = os.path.splitext(fname)[1].lower()
        if ext in supported:
            paths.append(os.path.join(folder, fname))
    return sorted(paths)


def frame_filename(video_stem: str, frame_number: int) -> str:
    """
    Build a unique, human-readable frame filename.
    Format:  <video_name>_frame_<frame_number>.jpg
    Example: video1_frame_0.jpg
    """
    return f"{video_stem}_frame_{frame_number}{IMAGE_EXT}"


def extract_frames_from_video(video_path: str, output_dir: str, frame_skip: int = FRAME_SKIP) -> int:
    """
    Read *video_path*, extract every *frame_skip*-th frame, and write each
    frame as a JPEG into *output_dir*.  Skips frames whose target file already
    exists to avoid overwriting existing data.

    Returns:
        Number of frames actually written in this run.
    """
    video_stem = os.path.splitext(os.path.basename(video_path))[0]

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"  [WARNING] Cannot open video: {video_path} — skipping.")
        return 0

    frames_written = 0
    frame_index    = 0          # Tracks every frame read from the video

    while True:
        ret, frame = cap.read()
        if not ret:
            break               # End of video or unreadable frame

        if frame_index % frame_skip == 0:
            filename  = frame_filename(video_stem, frame_index)
            dest_path = os.path.join(output_dir, filename)

            if os.path.exists(dest_path):
                # Duplicate detected — skip silently to protect existing data
                frame_index += 1
                continue

            success = cv2.imwrite(dest_path, frame)
            if success:
                frames_written += 1

        frame_index += 1

    cap.release()
    return frames_written


# ---------------------------------------------------------------------------
# Core pipeline
# ---------------------------------------------------------------------------

def process_label(label: str) -> None:
    """
    Process all videos for a single label ('real' or 'fake'):
      1. Resolve source and target directories.
      2. Create target directory if missing.
      3. Iterate over videos and extract frames.
    """
    source_dir = os.path.join(RAW_VIDEO_ROOT, label)
    target_dir = os.path.join(TRAINING_DATA_ROOT, label)

    if not os.path.isdir(source_dir):
        print(f"[INFO] Source directory not found, skipping: {source_dir}")
        return

    ensure_dir(target_dir)     # Safe — won't touch files already present

    video_paths = get_video_paths(source_dir)
    if not video_paths:
        print(f"[INFO] No videos found in: {source_dir}")
        return

    print(f"\n{'='*60}")
    print(f"  Label  : {label.upper()}")
    print(f"  Source : {source_dir}")
    print(f"  Target : {target_dir}")
    print(f"  Videos : {len(video_paths)}")
    print(f"{'='*60}")

    total_frames = 0

    for video_path in video_paths:
        video_name = os.path.basename(video_path)
        print(f"\n  Processing : {video_name}")

        frames_written = extract_frames_from_video(
            video_path=video_path,
            output_dir=target_dir,
            frame_skip=FRAME_SKIP,
        )

        print(f"  Frames extracted : {frames_written}")
        total_frames += frames_written

    print(f"\n  [DONE] Total frames written for '{label}': {total_frames}")


def run() -> None:
    """Entry point — process all labels sequentially."""
    print("\nDeepShield — Frame Extractor")
    print(f"Frame skip  : every {FRAME_SKIP}th frame")
    print(f"Source root : {RAW_VIDEO_ROOT}")
    print(f"Output root : {TRAINING_DATA_ROOT}\n")

    for label in LABELS:
        process_label(label)

    print(f"\n{'='*60}")
    print("  All videos processed. Dataset is ready for training.")
    print(f"{'='*60}\n")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    run()
