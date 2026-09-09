import { useState, useEffect } from "react";

const CROPS = [
  { label: "Onion",  value: "Onion"  },
  { label: "Potato", value: "Potato" },
  { label: "Tomato", value: "Tomato" },
  { label: "Wheat",  value: "Wheat"  },
];

function MarketPrices({ onForecast }) {
  const [commodity, setCommodity] = useState("Onion");
  const [prices, setPrices]       = useState([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/market/prices?commodity=${commodity}`)
      .then((r) => r.json())
      .then(setPrices)
      .catch(() => setPrices([]))
      .finally(() => setLoading(false));
  }, [commodity]);

  const crop = CROPS.find((c) => c.value === commodity);

  return (
    <div className="page-card">

      {/* Header — matches PricePrediction layout */}
      <div className="page-header">
        <div>
          <h2>Market Prices</h2>
          <p>Current prices across major APMCs.</p>
        </div>
        <span className="market-badge">{crop?.label}</span>
      </div>

      {/* Crop selector — same style as PricePrediction */}
      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="mp-commodity-select"
          style={{ display: "block", marginBottom: "4px", fontWeight: "600", fontSize: "13px", color: "#374151" }}
        >
          Crop
        </label>
        <select
          id="mp-commodity-select"
          value={commodity}
          onChange={(e) => setCommodity(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "15px", backgroundColor: "white", color: "#111827", minWidth: "160px" }}
        >
          {CROPS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading…</p>
      ) : prices.length === 0 ? (
        <p>No market prices found for {commodity}.</p>
      ) : (
        <div className="market-table-wrapper">
          <table className="market-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>District</th>
                <th>Variety</th>
                <th>Min</th>
                <th>Max</th>
                <th>Modal Price</th>
                <th>Arrival (t)</th>
                {onForecast && <th></th>}
              </tr>
            </thead>
            <tbody>
              {prices.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.market_name}</strong></td>
                  <td>{m.district}</td>
                  <td>{m.variety || "—"}</td>
                  <td>₹{m.min_price}/kg</td>
                  <td>₹{m.max_price}/kg</td>
                  <td className="modal-price">₹{m.modal_price}/kg</td>
                  <td>{m.arrival_quantity}</td>
                  {onForecast && (
                    <td>
                      <button
                        className="primary-button"
                        style={{ padding: "4px 12px", fontSize: "12px" }}
                        onClick={() => onForecast(commodity, m.market_name, m.modal_price)}
                      >
                        Forecast →
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default MarketPrices;