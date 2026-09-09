"""
prediction.py - Price prediction using trained ML models.
Supports both national (crop-level) and mandi-specific models.
"""

import os, re
from datetime import date, timedelta
import joblib

_DIR = os.path.dirname(os.path.abspath(__file__))

# Top 5 mandis per crop (mirrors train_mandi_model.py)
MANDI_MAP = {
    "Onion":  ["Bangalore", "Kayamkulam", "Hubli (Amaragol)", "Pratapgarh", "Palakkad"],
    "Potato": ["Durgapur", "English Bazar", "Faizabad", "Siwan", "Sultanpur"],
    "Tomato": ["Nagpur", "Sirsa", "Sultanpur", "Kottayam", "Dadri"],
    "Wheat":  ["Sehore", "Ganjbasoda", "Ashta", "Dhar", "Kalapipal"],
}

# National models (fallback)
_NATIONAL_MODELS = {}
_NATIONAL_STATS  = {}
for _crop, _fname in {
    "Onion": "onion_model.pkl", "Potato": "potato_model.pkl",
    "Tomato": "tomato_model.pkl", "Wheat": "wheat_model.pkl",
}.items():
    _p = os.path.join(_DIR, _fname)
    if os.path.exists(_p):
        _d = joblib.load(_p)
        _NATIONAL_MODELS[_crop] = _d["model"]
        _NATIONAL_STATS[_crop]  = _d["stats"]

# Mandi-specific models: { crop: { mandi: { model, stats } } }
def _safe(s):
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")

_MANDI_MODELS = {}
for _crop, _mandis in MANDI_MAP.items():
    _MANDI_MODELS[_crop] = {}
    for _mandi in _mandis:
        _p = os.path.join(_DIR, f"{_crop.lower()}_{_safe(_mandi)}_model.pkl")
        if os.path.exists(_p):
            _d = joblib.load(_p)
            _MANDI_MODELS[_crop][_mandi] = _d


def available_commodities():
    return list(MANDI_MAP.keys())


def available_mandis(commodity: str):
    """Return the list of mandis that have trained models for this crop."""
    crop_mandis = _MANDI_MODELS.get(commodity, {})
    loaded = [m for m in MANDI_MAP.get(commodity, []) if m in crop_mandis]
    return loaded if loaded else MANDI_MAP.get(commodity, [])


def _predict(model, current_price: float, days: int):
    predictions = []
    lag_quintal = current_price * 100
    for day in range(1, days + 1):
        d = date.today() + timedelta(days=day)
        doy = d.timetuple().tm_yday
        predicted_quintal = float(model.predict([[d.year, d.month, doy, lag_quintal]])[0])
        lag_quintal = predicted_quintal
        predictions.append({
            "date": str(d),
            "predicted_price": round(predicted_quintal / 100, 2),
        })
    return predictions


def predict_price(current_price: float, days: int = 7, commodity: str = "Onion", mandi: str = None):
    """
    Predict future prices.
    If mandi is provided and a mandi model exists, uses it.
    Falls back to national model, then simple trend formula.
    """
    # Try mandi-specific model first
    if mandi:
        mandi_data = _MANDI_MODELS.get(commodity, {}).get(mandi)
        if mandi_data:
            return _predict(mandi_data["model"], current_price, days)

    # Fallback: national model
    model = _NATIONAL_MODELS.get(commodity)
    if model:
        return _predict(model, current_price, days)

    # Last resort: simple trend
    return [
        {"date": str(date.today() + timedelta(days=i)), "predicted_price": round(current_price * (1 + 0.01 * i), 2)}
        for i in range(1, days + 1)
    ]


def get_commodity_stats(commodity: str = "Onion", mandi: str = None):
    """Return historical stats for a commodity/mandi combo."""
    if mandi:
        mandi_data = _MANDI_MODELS.get(commodity, {}).get(mandi)
        if mandi_data:
            return mandi_data["stats"]
    return _NATIONAL_STATS.get(commodity, {})
