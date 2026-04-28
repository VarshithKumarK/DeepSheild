from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
import base64
import os

def base64_to_image(base64_str, path):
    with open(path, "wb") as f:
        f.write(base64.b64decode(base64_str))


def generate_image_report(data, output_path="image_report.pdf"):
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Deepfake Image Report", styles["Title"]))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph(f"Label: {data['label']}", styles["Normal"]))
    elements.append(Paragraph(f"Confidence: {data['confidence']}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    # Signals
    if "signals" in data:
        elements.append(Paragraph("Signals:", styles["Heading2"]))
        for k, v in data["signals"].items():
            elements.append(Paragraph(f"{k}: {v}", styles["Normal"]))
        elements.append(Spacer(1, 12))

    # Explanation
    if "explanation" in data:
        elements.append(Paragraph("Explanation:", styles["Heading2"]))
        elements.append(Paragraph(data["explanation"], styles["Normal"]))
        elements.append(Spacer(1, 12))

    # Heatmap
    if "heatmap" in data and data["heatmap"]:
        img_path = "temp_heatmap.jpg"
        base64_to_image(data["heatmap"], img_path)
        elements.append(Paragraph("Heatmap:", styles["Heading2"]))
        elements.append(Image(img_path, width=300, height=300))

    doc.build(elements)

    if os.path.exists("temp_heatmap.jpg"):
        os.remove("temp_heatmap.jpg")

    return output_path


def generate_video_report(summary, frames, include_frames, include_heatmap, output_path="video_report.pdf"):
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Deepfake Video Report", styles["Title"]))
    elements.append(Spacer(1, 12))

    # Summary
    elements.append(Paragraph("Summary", styles["Heading2"]))
    elements.append(Paragraph(f"Final Label: {summary['label']}", styles["Normal"]))
    elements.append(Paragraph(f"Confidence: {summary['confidence']}", styles["Normal"]))
    elements.append(Paragraph(f"Total Frames: {summary['total_frames']}", styles["Normal"]))
    elements.append(Paragraph(f"Fake Frames: {summary['fake_frames']}", styles["Normal"]))
    elements.append(Paragraph(f"Real Frames: {summary['real_frames']}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    # Optional frame analysis
    if include_frames or include_heatmap:
        elements.append(Paragraph("Frame Analysis", styles["Heading2"]))

        for frame in frames:
            elements.append(Spacer(1, 10))
            elements.append(Paragraph(f"Frame {frame['frame_id']}", styles["Normal"]))
            elements.append(Paragraph(f"Label: {frame['label']}", styles["Normal"]))
            elements.append(Paragraph(f"Confidence: {frame['confidence']}", styles["Normal"]))

            if include_frames and frame.get("explanation"):
                elements.append(Paragraph(frame["explanation"], styles["Normal"]))

            if include_heatmap and frame.get("heatmap"):
                img_path = f"temp_frame_{frame['frame_id']}.jpg"
                base64_to_image(frame["heatmap"], img_path)
                elements.append(Image(img_path, width=200, height=200))

    doc.build(elements)

    # Cleanup temp files
    for f in os.listdir():
        if f.startswith("temp_frame_"):
            try:
                os.remove(f)
            except Exception:
                pass

    return output_path
