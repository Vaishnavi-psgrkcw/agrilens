"""
Severity Estimation — estimates % of leaf area affected by disease
using simple, explainable color-thresholding (HSV color space).

This is intentionally simple (no second deep learning model needed) —
easy to explain in a viva, and works reasonably well for brown/yellow
disease spots against green healthy leaf tissue.
"""

import cv2
import numpy as np
from PIL import Image


def estimate_severity(pil_image: Image.Image) -> dict:
    """
    Estimates the percentage of leaf area showing disease symptoms
    (brown/yellow/dark spots) vs healthy green tissue.

    Returns a dict with severity_percent and a severity_label.
    """
    img = np.array(pil_image.convert("RGB"))
    img_bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

    # Healthy green leaf range in HSV
    lower_green = np.array([25, 40, 40])
    upper_green = np.array([95, 255, 255])
    green_mask = cv2.inRange(hsv, lower_green, upper_green)

    # Total leaf area = green (healthy) + brown/yellow/dark (diseased) pixels
    # We approximate "leaf" as anything not pure background (near-white/black)
    lower_bg = np.array([0, 0, 200])
    upper_bg = np.array([180, 30, 255])
    bg_mask = cv2.inRange(hsv, lower_bg, upper_bg)
    leaf_mask = cv2.bitwise_not(bg_mask)

    leaf_pixels = cv2.countNonZero(leaf_mask)
    healthy_pixels = cv2.countNonZero(cv2.bitwise_and(green_mask, leaf_mask))

    if leaf_pixels == 0:
        return {"severity_percent": 0, "severity_label": "Unable to detect leaf area"}

    diseased_pixels = leaf_pixels - healthy_pixels
    severity_percent = round((diseased_pixels / leaf_pixels) * 100, 1)
    severity_percent = max(0, min(100, severity_percent))

    if severity_percent < 10:
        label = "Minimal"
    elif severity_percent < 30:
        label = "Mild"
    elif severity_percent < 60:
        label = "Moderate"
    else:
        label = "Severe"

    return {
        "severity_percent": severity_percent,
        "severity_label": label,
    }
