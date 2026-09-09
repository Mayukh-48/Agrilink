import { useState, useEffect } from "react";
import "./PricePrediction.css";

const COMMODITY_EMOJIS = {
  Onion:  "🧅",
  Potato: "🥔",
  Tomato: "🍅",
  Wheat:  "🌾",
};

// Simple SVG line chart — no extra library needed
function PriceChart({ predictions }) {
  if (!predictions.length) return null;

  const W = 620, H = 200, PAD = { top: 20, right: 20, bottom: 40, left: 55 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top  - PAD.bottom;

  const prices = predictions.map((p) => p.predicted_price);
  const minP   = Math.min(...prices);
  const maxP   = Math.max(...prices);
  const range  = maxP - minP || 1;

  const xStep = innerW / (predictions.length - 1);
  const toX   = (i)   => PAD.left + i * xStep;
  const toY   = (val) => PAD.top  + innerH - ((val - minP) / range) * innerH;

  const points = predictions.map((p, i) => `${toX(i)},${toY(p.predicted_price)}`).join(" ");
  const areaPoints = [
    `${toX(0)},${toY(minP)}`,
    ...predictions.map((p, i) => `${toX(i)},${toY(p.predicted_price)}`),
    `${toX(predictions.length - 1)},${toY(minP)}`,
  ].join(" ");

  // Y-axis ticks
  const yTicks = [minP, (minP + maxP) / 2, maxP];

  return (
    <div className="pp-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        {/* Grid lines */}
        {yTicks.map((v) => (
          <line
            key={v}
            x1={PAD.left} y1={toY(v)}
            x2={W - PAD.right} y2={toY(v)}
            stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4"
          />
        ))}

        {/* Area fill */}
        <polygon points={areaPoints} fill="#dcf5e4" opacity="0.5" />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#287a49"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {predictions.map((p, i) => (
          <circle
            key={p.date}
            cx={toX(i)} cy={toY(p.predicted_price)}
            r="4" fill="#287a49" stroke="white" strokeWidth="2"
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((v) => (
          <text
            key={v}
            x={PAD.left - 8} y={toY(v) + 4}
            textAnchor="end" fontSize="11" fill="#6b7280"
          >
            ₹{v.toFixed(0)}
          </text>
        ))}

        {/* X-axis labels (first, mid, last) */}
        {[0, Math.floor(predictions.length / 2), predictions.length - 1].map((i) => (
          <text
            key={i}
            x={toX(i)} y={H - PAD.bottom + 16}
            textAnchor="middle" fontSize="10" fill="#6b7280"
          >
            {predictions[i]?.date.slice(5)} {/* MM-DD */}
          </text>
        ))}
      </svg>
    </div>
  );
}

function TrendBadge({ predictions, currentPrice }) {
  if (!predictions.length || !currentPrice) return null;
  const last  = predictions[predictions.length - 1].predicted_price;
  const delta = ((last - currentPrice) / currentPrice) * 100;
  const up    = delta > 1;
  const down  = delta < -1;
  return (
    <span className={`pp-trend ${up ? "pp-trend-up" : down ? "pp-trend-down" : "pp-trend-flat"}`}>
      {up ? "↑" : down ? "↓" : "→"} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="pp-stat-pill">
      <span>{label}</span>
      <strong>{value != null ? `₹${value}/kg` : "—"}</strong>
    </div>
  );
}

export default function PricePrediction({ initialCommodity = "Onion", initialMandi = "", initialPrice = "" }) {
  const [commodities,   setCommodities]   = useState(["Onion", "Potato", "Tomato", "Wheat"]);
  const [commodity,     setCommodity]     = useState(initialCommodity);
  const [mandis,        setMandis]        = useState([]);
  const [mandi,         setMandi]         = useState(initialMandi);
  const [currentPrice,  setCurrentPrice]  = useState(initialPrice);
  const [days,          setDays]          = useState(7);
  const [predictions,   setPredictions]   = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");

  // Fetch available commodities
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/prediction/commodities")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length) setCommodities(data); })
      .catch(() => {});
  }, []);

  // When crop changes: fetch its mandis, reset mandi + predictions
  useEffect(() => {
    setPredictions([]);
    setStats(null);
    setMandi("");
    fetch(`http://127.0.0.1:8000/api/prediction/mandis?commodity=${commodity}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setMandis(data);
          setMandi(data[0]); // auto-select first mandi
        }
      })
      .catch(() => {});
  }, [commodity]);

  // When mandi changes: fetch stats for that specific mandi, auto-fill price
  useEffect(() => {
    if (!mandi) return;
    setStats(null);
    setPredictions([]);
    fetch(`http://127.0.0.1:8000/api/prediction/stats?commodity=${commodity}&mandi=${encodeURIComponent(mandi)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.latest) {
          setStats(data);
          setCurrentPrice(String(data.latest)); // auto-fill with latest mandi price
        }
      })
      .catch(() => {});
  }, [commodity, mandi]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const mandiParam = mandi ? `&mandi=${encodeURIComponent(mandi)}` : "";
      const resp = await fetch(
        `http://127.0.0.1:8000/api/prediction/price?current_price=${currentPrice}&days=${days}&commodity=${commodity}${mandiParam}`
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || "Prediction failed");
      setPredictions(data);
    } catch (err) {
      setError("Could not get prediction. Make sure the backend is running.");
      console.error(err);
    }
    setLoading(false);
  };

  const emoji = COMMODITY_EMOJIS[commodity] || "🌿";

  return (
    <div className="page-card pp-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Price Prediction 🤖</h2>
          <p>ML-powered forecasts from 2020–2026 India APMC data.</p>
        </div>
        <span className="market-badge">{emoji} {commodity}</span>
      </div>

      {/* Selectors row: Crop + Mandi */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'flex-end' }}>

        <div className="pp-commodity-dropdown">
          <label htmlFor="commodity-select" style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Crop</label>
          <select
            id="commodity-select"
            value={commodity}
            onChange={(e) => { setCommodity(e.target.value); setPredictions([]); }}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', backgroundColor: 'white', color: '#111827', minWidth: '160px' }}
          >
            {commodities.map((c) => (
              <option key={c} value={c}>{COMMODITY_EMOJIS[c] || "🌿"} {c}</option>
            ))}
          </select>
        </div>

        {mandis.length > 0 && (
          <div className="pp-commodity-dropdown">
            <label htmlFor="mandi-select" style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Mandi</label>
            <select
              id="mandi-select"
              value={mandi}
              onChange={(e) => { setMandi(e.target.value); setPredictions([]); }}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', backgroundColor: 'white', color: '#111827', minWidth: '200px' }}
            >
              {mandis.map((m) => (
                <option key={m} value={m}>🏪 {m}</option>
              ))}
            </select>
          </div>
        )}

      </div>

      {/* Historical stats strip */}
      {stats && (
        <div className="pp-stats-strip">
          <StatPill label="Latest (APMC avg)" value={stats.latest} />
          <StatPill label="Historical avg"    value={stats.mean}   />
          <StatPill label="Historical min"    value={stats.min}    />
          <StatPill label="Historical max"    value={stats.max}    />
          <span className="pp-stats-note">as of {stats.latest_date}</span>
        </div>
      )}

      {/* Form */}
      <form className="crop-form" onSubmit={handleSubmit}>
        <div className="form-grid">

          <div>
            <label>Your Current Price (₹/kg)</label>
            <input
              id="pp-current-price"
              type="number"
              step="0.01"
              min="0"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder={stats ? `e.g. ${stats.latest}` : "e.g. 32"}
              required
            />
          </div>

          <div>
            <label>Prediction Horizon (days)</label>
            <input
              id="pp-days"
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              required
            />
          </div>

        </div>

        <div className="form-buttons">
          <button
            id="pp-predict-btn"
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Predicting…" : `Predict ${emoji} ${commodity} Prices`}
          </button>
        </div>
      </form>

      {error && <p className="pp-error">{error}</p>}

      {/* Results */}
      {predictions.length > 0 && (
        <div className="pp-results">

          <div className="pp-results-header">
          <h3>Predicted Prices — next {days} days {mandi && <span style={{fontSize:'13px',color:'#6b7280',fontWeight:'400'}}>({mandi})</span>}</h3>
            <TrendBadge predictions={predictions} currentPrice={Number(currentPrice)} />
          </div>

          <PriceChart predictions={predictions} />

          <div className="prediction-grid">
            {predictions.map((p) => {
              const delta = Number(currentPrice)
                ? p.predicted_price - Number(currentPrice)
                : 0;
              const up   = delta > 0.01;
              const down = delta < -0.01;
              return (
                <div className="prediction-card" key={p.date}>
                  <span className="pp-date">{p.date}</span>
                  <strong className="pp-price">₹{p.predicted_price}/kg</strong>
                  {Number(currentPrice) > 0 && (
                    <small className={up ? "pp-delta-up" : down ? "pp-delta-down" : "pp-delta-flat"}>
                      {up ? "+" : ""}{delta.toFixed(2)}/kg
                    </small>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}