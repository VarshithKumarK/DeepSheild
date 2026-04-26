import os
import cv2
from app.video.extractor import extract_frames
from app.model.predict import predict
from app.model.model import load_model
from app.model.preprocess import extract_face

model = load_model()


def generate_timeline(results, fps):
    if not results:
        return []

    timeline = []
    current_label = results[0]["label"]
    start_time = results[0]["frame"] / fps

    for i in range(1, len(results)):
        r = results[i]
        if r["label"] != current_label:
            end_time = r["frame"] / fps
            timeline.append({
                "start": round(start_time, 2),
                "end": round(end_time, 2),
                "label": current_label,
                "color": "green" if current_label == "real" else "red"
            })
            current_label = r["label"]
            start_time = end_time

    # Add the final segment
    last_frame = results[-1]["frame"]
    end_time = (last_frame + 1) / fps
    timeline.append({
        "start": round(start_time, 2),
        "end": round(end_time, 2),
        "label": current_label,
        "color": "green" if current_label == "real" else "red"
    })

    return timeline

def process_video(video_path, explain=False):
    frames = extract_frames(video_path)

    # Get video FPS to calculate timeline timestamps accurately
    cap = cv2.VideoCapture(video_path)
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    if video_fps <= 0:
        video_fps = 30.0
    cap.release()
    
    # extract_frames skips 10 frames by default, so the effective FPS of our 'results' is:
    effective_fps = video_fps / 10.0

    results = []
    key_frames = []
    fake_count = 0

    # Optional debug setup
    debug_dir = "outputs/frames"
    os.makedirs(debug_dir, exist_ok=True)
    saved_debug_frames = 0

    for idx, frame in enumerate(frames):
        try:
            # 1. Detect and evaluate face
            face = extract_face(frame)

            # 2. Skip if no face strictly detected
            if face is None:
                continue

            # 3. Save purely the first 5 frames for debugging metrics
            if saved_debug_frames < 5:
                cv2.imwrite(os.path.join(debug_dir, f"debug_face_{idx}.jpg"), face)
                saved_debug_frames += 1

            # 4. Optional optimization for explainability
            if explain and idx % 10 != 0:
                continue

            # 5. Progress into prediction
            if explain:
                label, prob, heatmap_info, signals, explanation = predict(model, face, explain=True)
                results.append({
                    "frame": idx,
                    "label": label,
                    "confidence": prob,
                    "signals": signals,
                    "heatmap_info": heatmap_info,
                    "explanation": explanation
                })
            else:
                label, prob = predict(model, face, explain=False)
                results.append({"frame": idx, "label": label, "confidence": prob})

            if label == "fake":
                fake_count += 1
                
                # 5. Extract Key Frames for high-confidence fakes
                if prob > 0.8:
                    key_frames.append(idx)

        except Exception as e:
            print(f"Frame {idx} error:", e)

    # Final decision based on processed frames (face-detected frames only)
    total_processed = len(results)
    if total_processed == 0:
        final_label = "unknown"
        avg_confidence = 0.0
    else:
        final_label = "fake" if fake_count > total_processed * 0.5 else "real"
        avg_confidence = sum(r["confidence"] for r in results) / total_processed

    # Generate timeline
    timeline = generate_timeline(results, fps=effective_fps)

    return {
        "final_prediction": final_label,
        "timeline": timeline,
        "frames": results,
        "key_frames": key_frames,
        "avg_confidence": round(avg_confidence, 4),
        "processed_frames": total_processed,
        "total_skipped": len(frames) - total_processed
    }
