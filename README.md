# 🌾 AgriLens — Crop Disease & Severity Detector

Final year project: CNN-based crop disease detection with severity estimation and treatment advice — no external AI APIs, fully self-trained model.

---

## 🗂️ Project Structure

```
agrilens/
├── ml-model/
│   ├── notebooks/
│   │   └── train_model.ipynb   ← Run this in Google Colab to train your CNN
│   └── saved_model/            ← Trained model files go here (you'll add these)
├── ml-api/                     ← Flask API that serves the trained model
│   ├── app.py
│   ├── treatment_advisor.py    ← Rule-based treatment recommendations
│   ├── severity_estimator.py   ← Image-based severity % estimation
│   └── requirements.txt
├── server/                     ← Node.js + Express backend (talks to Flask + PostgreSQL)
│   ├── routes/
│   ├── schema.sql
│   └── index.js
└── client/                     ← React frontend
    └── src/pages/
```

**Three services run together:**
```
React (3000)  ->  Node.js/Express (5001)  ->  Flask ML API (5050)
                          |
                     PostgreSQL
```

---

## Setup — Step by Step

### Step 1: Train your model (Google Colab — do this FIRST)

1. Go to https://colab.research.google.com
2. Upload `ml-model/notebooks/train_model.ipynb`
3. Runtime -> Change runtime type -> **GPU (T4)**
4. Run all cells top to bottom (takes ~20-40 min total)
5. At the end, it downloads `agrilens_model.keras` and `class_names.json`
6. Place both files into `ml-model/saved_model/` on your computer

The notebook defaults to 5 tomato disease classes to keep training fast. You can expand to more crops/classes later by updating SELECTED_CLASSES in the notebook.

### Step 2: PostgreSQL Database

```powershell
psql -U postgres
CREATE DATABASE agrilens;
\q
cd server
psql -U postgres -d agrilens -f schema.sql
```

### Step 3: Flask ML API

```powershell
cd ml-api
pip install -r requirements.txt
python app.py
```
Runs on http://localhost:5050. You should see "Model loaded. Classes: [...]"

### Step 4: Node.js Backend

Edit server/.env with your PostgreSQL password, then:
```powershell
cd server
npm install
npm run dev
```
Runs on http://localhost:5001

### Step 5: React Frontend

```powershell
cd client
npm install
npm start
```
Runs on http://localhost:3000

---

## Features

| Feature | Description |
|---------|-------------|
| Leaf Scan | Upload/drag a leaf photo, CNN predicts disease |
| Severity Estimation | % of leaf affected, via color-thresholding |
| Treatment Advisor | Organic + chemical treatment, rule-based |
| Field Tracking | Organize scans by field/crop |
| Scan History | Past scans with timestamps |
| Analytics | Disease frequency charts |

---

## For Your Project Report

Key things to document (the notebook outputs these for you):
- Confusion matrix (confusion_matrix.png) — per-class accuracy
- Training curves (training_curves.png) — accuracy/loss over epochs
- Classification report — precision, recall, F1-score per disease class
- Architecture choice justification — why transfer learning (MobileNetV2) over training from scratch: faster convergence, works well with smaller datasets, lower compute requirement

### Suggested report sections
1. Problem statement & motivation (smallholder farmer access to expert diagnosis)
2. Dataset (PlantVillage — cite source)
3. Model architecture (MobileNetV2 + custom classification head, transfer learning + fine-tuning)
4. Severity estimation methodology (HSV color thresholding — explain why this is simpler/explainable vs a second CNN)
5. System architecture diagram (React -> Express -> Flask -> PostgreSQL)
6. Results (accuracy, confusion matrix, per-class metrics)
7. Limitations & future work (expand to more crops, on-device deployment with TensorFlow Lite for true offline use)

---

## Future extensions (mention in report as future work)

- TensorFlow Lite conversion for true mobile offline use
- Expand to all 38 PlantVillage classes
- Multi-leaf batch scanning
- SMS-based alerts for farmers without smartphones
