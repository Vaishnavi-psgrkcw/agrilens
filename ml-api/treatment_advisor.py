"""
Treatment Advisor — Rule-based recommendations (no external API needed).
Maps each disease class to practical, low-cost treatment guidance.
Extend this dictionary as you add more crop classes to your model.
"""

TREATMENT_GUIDE = {
    "Tomato_healthy": {
        "severity_relevant": False,
        "summary": "Plant appears healthy.",
        "organic_treatment": "No treatment needed. Continue regular watering and monitoring.",
        "chemical_treatment": "Not applicable.",
        "prevention": "Maintain consistent watering, avoid overhead irrigation, ensure good air circulation between plants.",
    },
    "Tomato_Early_blight": {
        "severity_relevant": True,
        "summary": "Fungal disease causing dark concentric spots on lower leaves, spreading upward.",
        "organic_treatment": "Remove and destroy infected leaves. Apply neem oil spray every 7-10 days. Use copper-based organic fungicide.",
        "chemical_treatment": "Apply chlorothalonil or mancozeb-based fungicide as per label instructions.",
        "prevention": "Rotate crops yearly, avoid wetting leaves while watering, mulch soil to prevent spore splash-up.",
    },
    "Tomato_Late_blight": {
        "severity_relevant": True,
        "summary": "Aggressive water-mold disease, can destroy crop within days in humid conditions. Treat urgently.",
        "organic_treatment": "Remove infected plants immediately to prevent spread. Apply copper-based fungicide.",
        "chemical_treatment": "Apply systemic fungicide containing metalaxyl or cymoxanil immediately — this disease spreads fast.",
        "prevention": "Avoid overhead watering, ensure good drainage, monitor closely during humid/rainy weather.",
    },
    "Tomato_Leaf_Mold": {
        "severity_relevant": True,
        "summary": "Fungal disease common in humid greenhouse conditions, causing yellow spots with mold on leaf undersides.",
        "organic_treatment": "Improve ventilation, reduce humidity, remove affected leaves, apply baking soda spray (1 tbsp/gallon water).",
        "chemical_treatment": "Apply chlorothalonil-based fungicide if organic methods are insufficient.",
        "prevention": "Increase plant spacing, ventilate greenhouses/polyhouses, avoid high humidity above 85%.",
    },
    "Tomato_Bacterial_spot": {
        "severity_relevant": True,
        "summary": "Bacterial disease causing small dark spots with yellow halos on leaves and fruit.",
        "organic_treatment": "Remove infected plant debris, apply copper-based bactericide, avoid working with wet plants.",
        "chemical_treatment": "Copper hydroxide or copper oxychloride sprays at first sign of symptoms.",
        "prevention": "Use disease-free seeds/seedlings, avoid overhead irrigation, practice 2-3 year crop rotation.",
    },
}

DEFAULT_ADVICE = {
    "severity_relevant": True,
    "summary": "Disease detected — consult local agricultural extension officer for confirmation.",
    "organic_treatment": "Isolate affected plants, remove visibly infected leaves, monitor closely.",
    "chemical_treatment": "Consult a local agricultural expert before applying chemical treatment.",
    "prevention": "Maintain crop rotation, proper spacing, and field hygiene.",
}


def get_treatment(disease_class: str) -> dict:
    """Returns treatment advice for a given disease class name."""
    return TREATMENT_GUIDE.get(disease_class, DEFAULT_ADVICE)
