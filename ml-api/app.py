"""
AgriLens ML API — serves the trained CNN model for crop disease detection.

Run with: python app.py
Requires: agrilens_model.keras and class_names.json in saved_model/
(download these from the Colab training notebook first)
"""

import json
import os

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io

from treatment_advisor import get_treatment
from severity_estimator import estimate_severity

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ml-model", "saved_model", "agrilens_model.keras")
CLASSES_PATH = os.path.join(os.path.dirname(__file__), "..", "ml-model", "saved_model", "class_names.json")
IMG_SIZE = (224, 224)

model = None
class_names = []


def load_model():
    """Lazy-loads the model on first request (or at startup)."""
    global model, class_names
    import tensorflow as tf

    if not os.path.exists(MODEL_PATH):
        print(f"⚠️  Model not found at {MODEL_PATH}")
        print("    Train it using the Colab notebook first, then place the files in ml-model/saved_model/")
        return

    model = tf.keras.models.load_model(MODEL_PATH)
    with open(CLASSES_PATH) as f:
        class_names = json.load(f)
    print(f"✅ Model loaded. Classes: {class_names}")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "classes": class_names,
    })


@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Train and place model files first."}), 503

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    try:
        file = request.files["image"]
        img = Image.open(io.BytesIO(file.read())).convert("RGB")

        # Preprocess for the model
        img_resized = img.resize(IMG_SIZE)
        img_array = np.array(img_resized) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Predict disease class
        predictions = model.predict(img_array)[0]
        top_idx = int(np.argmax(predictions))
        confidence = float(predictions[top_idx])
        predicted_class = class_names[top_idx]

        # Top 3 predictions (useful for UI — show alternatives)
        top3_idx = np.argsort(predictions)[-3:][::-1]
        top3 = [
            {"class": class_names[i], "confidence": round(float(predictions[i]) * 100, 2)}
            for i in top3_idx
        ]

        # Severity estimation (only meaningful if diseased)
        treatment = get_treatment(predicted_class)
        severity = None
        if treatment.get("severity_relevant", True):
            severity = estimate_severity(img)

        return jsonify({
            "predicted_class": predicted_class,
            "confidence_percent": round(confidence * 100, 2),
            "top_predictions": top3,
            "severity": severity,
            "treatment": treatment,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    load_model()
    app.run(host="0.0.0.0", port=5050, debug=True)
