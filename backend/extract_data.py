import pandas as pd
import os

commodities = ['Onion', 'Potato', 'Tomato', 'Wheat']
years = range(2020, 2027)
frames = {c: [] for c in commodities}

for yr in years:
    path = rf'D:\Downloads\csv\{yr}.csv'
    if not os.path.exists(path):
        continue
    for chunk in pd.read_csv(
        path,
        chunksize=100000,
        usecols=['Arrival_Date', 'Commodity', 'Modal_Price', 'Min_Price', 'Max_Price']
    ):
        for c in commodities:
            filtered = chunk[chunk['Commodity'] == c]
            if len(filtered) > 0:
                frames[c].append(filtered)
    print(f'{yr}: done', flush=True)

for c in commodities:
    if frames[c]:
        df = pd.concat(frames[c], ignore_index=True)
        fname = c.lower().replace(' ', '_') + '_prices.csv'
        df.to_csv(fname, index=False)
        print(f'Saved {c}: {len(df)} rows', flush=True)
