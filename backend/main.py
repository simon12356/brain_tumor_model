from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from PIL import Image
import numpy as np
import io

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "brain_tumor_model1.keras"

app = FastAPI()

# 1. ALLOW REACT TO CALL YOU
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # in production, use ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model(MODEL_PATH)
classes = ["glioma", "meningioma", "notumor", "pituitary"]

@app.get("/")
def home():
    return {"message": "Brain Tumor Detection API Running 🚀"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image = image.resize((128, 128))

        image_array = np.array(image) / 255.0
        image_array = np.expand_dims(image_array, axis=0)

        prediction = model.predict(image_array)
        predicted_class = int(np.argmax(prediction))
        confidence = float(np.max(prediction)) # 0-1, NOT *100

        return {
            "prediction": classes[predicted_class],
            "confidence": confidence # matches your TS interface
        }
    except Exception as e:
        # 2. RETURN REAL ERROR CODE
        raise HTTPException(status_code=500, detail=str(e))