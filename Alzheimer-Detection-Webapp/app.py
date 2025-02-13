from flask import Flask, request, render_template, jsonify
from PIL import Image
import numpy as np
import tensorflow as tf
import os

app = Flask(__name__)

# Load trained model
model = tf.keras.models.load_model("optimized_model.h5")

# Class labels
label_mapping = {0: "Mild Demented", 1: "Moderate Demented", 2: "Non Demented", 3: "Very Mild Demented"}

# Ensure upload directory exists
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"})

    file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # Preprocess the image
    image = Image.open(file_path).convert("RGB").resize((128, 128))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)

    # Make prediction
    predictions = model.predict(image)
    predicted_label = label_mapping[np.argmax(predictions)]

    return jsonify({"prediction": predicted_label})

if __name__ == "__main__":
    app.run(debug=True)
