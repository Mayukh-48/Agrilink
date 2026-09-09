"""
train_mandi_model.py - Train per-mandi price prediction models.
Reads yearly CSVs from D:\Downloads\csv and trains one model per (crop, mandi).
Saves as {crop}_{safe_mandi}_model.pkl

Usage: python train_mandi_model.py
"""

import os, re
import pandas as pd
import joblib
from sklearn.ensemble import GradientBoostingRegressor

MANDI_MAP = {
    "Onion":  ["Bangalore", "Kayamkulam", "Hubli (Amaragol)", "Pratapgarh", "Palakkad"],
    "Potato": ["Durgapur", "English Bazar", "Faizabad", "Siwan", "Sultanpur"],
    "Tomato": ["Nagpur", "Sirsa", "Sultanpur", "Kottayam", "Dadri"],
    "Wheat":  ["Sehore", "Ganjbasoda", "Ashta", "Dhar", "Kalapipal"],
}

CSV_DIR = r"D:\Downloads\csv"
YEARS   = range(2020, 2027)


def safe_name(s):
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


def train_one(crop, mandi, df):
    df = df[["Arrival_Date", "Modal_Price"]].copy()
    df["Arrival_Date"] = pd.to_datetime(df["Arrival_Date"], errors="coerce")
    df["Modal_Price"]  = pd.to_numeric(df["Modal_Price"],  errors="coerce")
    df = df.dropna()
    df = df[df["Modal_Price"] > 0]

    daily = (
        df.groupby("Arrival_Date")["Modal_Price"]
        .mean()
        .reset_index()
        .sort_values("Arrival_Date")
    )

    if len(daily) < 30:
        print(f"  SKIP {crop}/{mandi}: only {len(daily)} daily rows")
        return None

    daily["DayOfYear"] = daily["Arrival_Date"].dt.dayofyear
    daily["Month"]     = daily["Arrival_Date"].dt.month
    daily["Year"]      = daily["Arrival_Date"].dt.year
    daily["Lag7"]      = daily["Modal_Price"].shift(7).bfill()

    X = daily[["Year", "Month", "DayOfYear", "Lag7"]]
    y = daily["Modal_Price"]

    model = GradientBoostingRegressor(n_estimators=200, max_depth=4, learning_rate=0.05, random_state=42)
    model.fit(X, y)

    stats = {
        "mean":        round(float(y.mean()) / 100, 2),
        "min":         round(float(y.min())  / 100, 2),
        "max":         round(float(y.max())  / 100, 2),
        "latest":      round(float(daily["Modal_Price"].iloc[-1]) / 100, 2),
        "latest_date": str(daily["Arrival_Date"].iloc[-1].date()),
    }
    print(f"  {crop}/{mandi}: {len(daily)} days, latest=Rs.{stats['latest']}/kg ({stats['latest_date']})")
    return {"model": model, "stats": stats}


def main():
    all_crops = list(MANDI_MAP.keys())
    frames = {c: {m: [] for m in MANDI_MAP[c]} for c in all_crops}

    for yr in YEARS:
        path = os.path.join(CSV_DIR, f"{yr}.csv")
        if not os.path.exists(path):
            print(f"Skipping {yr}: not found")
            continue
        print(f"Reading {yr}...")
        for chunk in pd.read_csv(path, chunksize=100000, usecols=["Arrival_Date", "Commodity", "Market", "Modal_Price"]):
            for crop in all_crops:
                crop_chunk = chunk[chunk["Commodity"] == crop]
                if crop_chunk.empty:
                    continue
                for mandi in MANDI_MAP[crop]:
                    sub = crop_chunk[crop_chunk["Market"] == mandi]
                    if len(sub) > 0:
                        frames[crop][mandi].append(sub[["Arrival_Date", "Modal_Price"]])

    print("\n--- Training ---")
    out_dir = os.path.dirname(os.path.abspath(__file__))
    for crop in all_crops:
        for mandi in MANDI_MAP[crop]:
            parts = frames[crop][mandi]
            if not parts:
                print(f"  SKIP {crop}/{mandi}: no data")
                continue
            df = pd.concat(parts, ignore_index=True)
            result = train_one(crop, mandi, df)
            if result:
                fname = f"{crop.lower()}_{safe_name(mandi)}_model.pkl"
                joblib.dump(result, os.path.join(out_dir, fname))
                print(f"  Saved {fname}")

    print("\nDone.")


if __name__ == "__main__":
    main()
