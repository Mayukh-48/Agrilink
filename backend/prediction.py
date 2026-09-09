"""
prediction.py — Price prediction using trained ML models.
Falls back to a simple linear formula if no .pkl is found.
"""

import os
from datetime import date, timedelta

import joblib

# Load all available models at import time
_MODELS = {}
_STATS = {}

_COMMODITY_FILES = {
    'Onion':  'onion_model.pkl',
    'Potato': 'potato_model.pkl',
    'Tomato': 'tomato_model.pkl',
    'Wheat':  'wheat_model.pkl',
}

for _name, _fname in _COMMODITY_FILES.items():
    _path = os.path.join(os.path.dirname(__file__), _fname)
    if os.path.exists(_path):
        _data = joblib.load(_path)
        _MODELS[_name] = _data['model']
        _STATS[_name]  = _data['stats']


def available_commodities():
    """Return list of commodities we have trained models for."""
    if _MODELS:
        return list(_MODELS.keys())
    # fallback: at least offer Onion
    return ['Onion', 'Potato', 'Tomato', 'Wheat']


def predict_price(current_price: float, days: int = 7, commodity: str = 'Onion'):
    """
    Predict future prices.
    Uses a trained GradientBoosting model when available;
    falls back to a simple trend formula otherwise.

    current_price is in Rs/kg (from the UI).
    The model was trained on Rs/quintal, so we convert internally.
    """
    predictions = []
    model = _MODELS.get(commodity)

    # Convert user's Rs/kg input to Rs/quintal for the model
    lag_quintal = current_price * 100

    for day in range(1, days + 1):
        target_date = date.today() + timedelta(days=day)

        if model is not None:
            doy   = target_date.timetuple().tm_yday
            month = target_date.month
            year  = target_date.year
            predicted_quintal = float(model.predict([[year, month, doy, lag_quintal]])[0])
            predicted_per_kg  = round(predicted_quintal / 100, 2)
            # Roll lag forward so next day's prediction reacts to this one
            lag_quintal = predicted_quintal
        else:
            # ponytail: fallback formula, replace when model exists
            predicted_per_kg = round(current_price * (1 + 0.01 * day), 2)

        predictions.append({
            'date':            str(target_date),
            'predicted_price': predicted_per_kg,
        })

    return predictions



def get_commodity_stats(commodity: str = 'Onion'):
    """Return historical stats for a commodity (for the UI info strip)."""
    return _STATS.get(commodity, {})