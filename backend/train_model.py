"""
train_model.py — Run this ONCE to train the price prediction models.
Reads *_prices.csv files in the same folder and saves *_model.pkl files.

Usage: python train_model.py
"""

import os
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
import joblib

COMMODITIES = {
    'Onion':  'onion_prices.csv',
    'Potato': 'potato_prices.csv',
    'Tomato': 'tomato_prices.csv',
    'Wheat':  'wheat_prices.csv',
}

def train(name, csv_path):
    print(f"Training {name}...")
    df = pd.read_csv(csv_path)
    df['Arrival_Date'] = pd.to_datetime(df['Arrival_Date'], errors='coerce')
    df = df.dropna(subset=['Arrival_Date', 'Modal_Price'])
    df['Modal_Price'] = pd.to_numeric(df['Modal_Price'], errors='coerce')
    df = df.dropna(subset=['Modal_Price'])
    df = df[df['Modal_Price'] > 0]

    # Build daily national average
    daily = (
        df.groupby('Arrival_Date')['Modal_Price']
        .mean()
        .reset_index()
        .sort_values('Arrival_Date')
    )

    daily['DayOfYear'] = daily['Arrival_Date'].dt.dayofyear
    daily['Month']     = daily['Arrival_Date'].dt.month
    daily['Year']      = daily['Arrival_Date'].dt.year
    # Lag features: previous 7-day mean
    daily['Lag7']      = daily['Modal_Price'].shift(7).bfill()

    X = daily[['Year', 'Month', 'DayOfYear', 'Lag7']]
    y = daily['Modal_Price']

    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        random_state=42
    )
    model.fit(X, y)

    # Stats stored as Rs/kg (divide quintal price by 100)
    stats = {
        'mean':        round(float(y.mean())             / 100, 2),
        'min':         round(float(y.min())              / 100, 2),
        'max':         round(float(y.max())              / 100, 2),
        'latest':      round(float(daily['Modal_Price'].iloc[-1]) / 100, 2),
        'latest_date': str(daily['Arrival_Date'].iloc[-1].date()),
    }

    out_name = name.lower() + '_model.pkl'
    joblib.dump({'model': model, 'stats': stats}, out_name)
    print(f"  Saved {out_name} | rows={len(daily)} | last_price=Rs.{stats['latest']}/quintal")


if __name__ == '__main__':
    for name, csv_path in COMMODITIES.items():
        if os.path.exists(csv_path):
            train(name, csv_path)
        else:
            print(f"Skipping {name}: {csv_path} not found")
    print("Done.")
