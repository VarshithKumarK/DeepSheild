import cv2
import numpy as np

def extract_signals(image, label, confidence, face_detected):
    signals = {}
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Brightness
    brightness = np.mean(gray)
    signals["brightness"] = float(brightness)

    # Blur (sharpness)
    blur = cv2.Laplacian(gray, cv2.CV_64F).var()
    signals["sharpness"] = float(blur)

    # Noise estimation
    noise = np.std(gray)
    signals["noise"] = float(noise)

    # Confidence category
    if confidence > 0.9:
        signals["confidence_level"] = "high"
    elif confidence > 0.6:
        signals["confidence_level"] = "medium"
    else:
        signals["confidence_level"] = "low"

    # Flags
    flags = []

    if brightness < 40:
        flags.append("low_light")

    if blur < 50:
        flags.append("blurry_image")

    if label == "fake" and confidence > 0.9:
        flags.append("strong_fake_pattern")

    if not face_detected:
        flags.append("no_face_detected")

    signals["flags"] = flags

    return signals
