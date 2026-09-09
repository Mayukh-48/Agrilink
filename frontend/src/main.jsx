import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./style.css";

const API = "http://127.0.0.1:8000/api";

function App() {
  const [commodity, setCommodity] = useState("Onion");
  const [district, setDistrict] = useState("Nashik");
  const [prices, setPrices] = useState([]);
  const [lots, setLots] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Marketplace filter state — independent of the form
  const [marketCommodity, setMarketCommodity] = useState("Onion");
  const [marketSearch, setMarketSearch] = useState("");

  const [form, setForm] = useState({
    commodity: "Onion", quantity_kg: 5000, quality_grade: "A",
    district: "Nashik", harvest_date: "", expected_price: ""
  });

  async function loadData() {
    setLoadError(null);
    try {
      const [p, f, l] = await Promise.all([
        axios.get(`${API}/market/prices?commodity=${commodity}`),
        axios.get(`${API}/prediction/price?commodity=${commodity}&district=${district}`),
        axios.get(`${API}/crop-lots`)
      ]);
      setPrices(p.data); setForecast(f.data); setLots(l.data);
    } catch (err) {
      setLoadError("Could not load market data. Is the backend running?");
      console.error("loadData failed:", err);
    }
  }

  useEffect(() => { loadData().catch(console.error); }, [commodity, district]);

  async function addLot(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        farmer_id: 1,
        ...form,
        quantity_kg: Number(form.quantity_kg),
        expected_price: form.expected_price ? Number(form.expected_price) : 0,
        harvest_date: form.harvest_date || new Date().toISOString().split("T")[0]
      };
      const res = await axios.post(`${API}/crop-lots`, null, { params: payload });
      setLots(prev => [res.data, ...prev]);
      // Try to find buyers for this lot
      if (res.data.crop_lot_id) {
        try {
          const b = await axios.get(`${API}/buyers/match/${res.data.crop_lot_id}`);
          if (b.data.matches) {
            setBuyers(b.data.matches);
            setSelectedLot({ ...res.data, id: res.data.crop_lot_id });
          }
        } catch { /* buyer matching is best-effort */ }
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Could not create lot");
    } finally { setLoading(false); }
  }

  async function selectLot(lot) {
    const lotId = lot.id || lot.crop_lot_id;
    setSelectedLot(lot);
    try {
      const b = await axios.get(`${API}/buyers/match/${lotId}`);
      if (b.data.matches) {
        setBuyers(b.data.matches);
      }
    } catch (err) {
      console.error("Could not load buyer matches:", err);
      setBuyers([]);
    }
  }

  async function sendOffer(buyer) {
    if (!selectedLot) return;
    const lotId = selectedLot.id || selectedLot.crop_lot_id;
    try {
      await axios.post(`${API}/offers`, null, {
        params: {
          crop_lot_id: lotId,
          buyer_id: buyer.buyer_id,
          offered_price_per_kg: buyer.max_price_per_kg,
          quantity_kg: selectedLot.quantity_kg
        }
      });
      alert(`Offer sent to ${buyer.business_name}`);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not send offer");
    }
  }

  const chartData = (forecast?.predictions?.forecast || forecast?.forecast || []).map((price, i) => ({ day: `Day ${i + 1}`, price: Number(price) }));

  // Filtered market prices — independent of form state
  const filteredPrices = prices.filter(p => {
    if (marketSearch.trim()) {
      const q = marketSearch.toLowerCase();
      return (
        (p.market_name || p.apmc || "").toLowerCase().includes(q) ||
        (p.district || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">
            <svg className="brand-leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 1 8-1 3.5-3.1 5.5-5 7" />
              <path d="M11.7 13.2c-.3-2.4.5-4.5 1.8-6.2" />
            </svg>
            AgriLink
          </div>
        </div>
        <div className="language">English · मराठी · हिंदी</div>
      </header>

      <main className="container">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="hero">
          <div>
            <h1>Sell smarter, not just faster.</h1>
            <p className="hero-subtitle">
              Compare markets, forecast prices, discover verified buyers and estimate your net realization.
            </p>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-label">Best market today</div>
            <div className="hero-stat-market">{prices[0]?.market_name || prices[0]?.apmc || "Loading..."}</div>
            <div className="hero-stat-price">₹{prices[0]?.modal_price?.toFixed(2) || "--"}/kg</div>
          </div>
        </section>

        {loadError && <p className="error-text" style={{ marginBottom: 20 }}>{loadError}</p>}

        {/* ── Main layout: Form + Market Prices ────────────────── */}
        <div className="grid-2col">

          {/* ── Create Crop Lot ─────────────────────────────────── */}
          <section className="card section">
            <h2 style={{ marginBottom: 20 }}>Create Crop Lot</h2>
            <form onSubmit={addLot}>
              <div className="form-group">
                <label htmlFor="lot-commodity">Commodity</label>
                <select id="lot-commodity" value={form.commodity} onChange={e => {
                  setForm({...form, commodity: e.target.value});
                  setCommodity(e.target.value);
                }}>
                  <option>Onion</option><option>Tomato</option><option>Potato</option><option>Wheat</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="lot-qty">Quantity (kg)</label>
                <input id="lot-qty" type="number" min="1" value={form.quantity_kg}
                  onChange={e => setForm({...form, quantity_kg: e.target.value})} />
              </div>

              <div className="form-group">
                <label htmlFor="lot-grade">Quality Grade</label>
                <select id="lot-grade" value={form.quality_grade}
                  onChange={e => setForm({...form, quality_grade: e.target.value})}>
                  <option>A</option><option>B</option><option>C</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="lot-district">District</label>
                <select id="lot-district" value={form.district} onChange={e => {
                  setForm({...form, district: e.target.value});
                  setDistrict(e.target.value);
                }}>
                  <option>Nashik</option><option>Pune</option><option>Mumbai</option><option>Ahmednagar</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="lot-harvest">Harvest Date</label>
                <input id="lot-harvest" type="date" value={form.harvest_date}
                  onChange={e => setForm({...form, harvest_date: e.target.value})} />
              </div>

              <div className="form-group">
                <label htmlFor="lot-price">Expected Price (₹/kg)</label>
                <input id="lot-price" type="number" min="0" step="0.5" placeholder="Optional"
                  value={form.expected_price}
                  onChange={e => setForm({...form, expected_price: e.target.value})} />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Lot & Find Buyers"}
              </button>
            </form>
          </section>

          {/* ── Market Prices ──────────────────────────────────── */}
          <section className="section">
            <div className="section-header">
              <h2>Market Prices</h2>
            </div>

            <div className="market-filters">
              <div className="filter-group">
                <label htmlFor="market-commodity" className="filter-label">Commodity</label>
                <select
                  id="market-commodity"
                  className="filter-select"
                  value={marketCommodity}
                  onChange={e => {
                    setMarketCommodity(e.target.value);
                    setCommodity(e.target.value);
                  }}
                >
                  <option>Onion</option><option>Tomato</option><option>Potato</option><option>Wheat</option>
                </select>
              </div>

              <div className="filter-divider" aria-hidden="true" />

              <input
                type="search"
                className="filter-search"
                placeholder="Search by market or district…"
                value={marketSearch}
                onChange={e => setMarketSearch(e.target.value)}
                aria-label="Search markets"
              />
            </div>

            {filteredPrices.length === 0 && !loadError ? (
              <p className="empty-state">No markets found for this commodity.</p>
            ) : (
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>District</th>
                    <th>Variety</th>
                    <th>Arrival (T)</th>
                    <th>Range (₹/kg)</th>
                    <th>Modal Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrices.map(p => (
                    <tr key={p.id}>
                      <td className="price-market-name">{p.market_name || p.apmc}</td>
                      <td className="price-district">{p.district}</td>
                      <td className="price-district">{p.variety || "—"}</td>
                      <td className="price-arrival">{p.arrival_quantity}</td>
                      <td className="price-range">₹{p.min_price}–{p.max_price}</td>
                      <td className="price-modal">₹{p.modal_price?.toFixed(2)}/kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>

        {/* ── AI Price Forecast ────────────────────────────────── */}
        <section className="card section">
          <div className="section-header">
            <h2>Price Forecast</h2>
          </div>
          <div className="forecast-header">
            <div className="forecast-current">
              <span className="forecast-current-label">Current price · {commodity}</span>
              <span className="forecast-current-price">₹{forecast?.current_price?.toFixed(2) || "--"}/kg</span>
            </div>
            {forecast?.recommendation && (
              <div className="forecast-recommendation">
                {forecast.recommendation}
              </div>
            )}
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EBE4" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#7A8272" }} />
                <YAxis tick={{ fontSize: 12, fill: "#7A8272" }} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #E8EBE4",
                    borderRadius: 6,
                    fontSize: 13,
                    boxShadow: "0 2px 8px rgba(26,29,23,0.07)"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2D6A4F"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#2D6A4F" }}
                  activeDot={{ r: 5, fill: "#1B4332" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="forecast-note">
            Forecast based on historical price data. Intended as a planning aid — actual prices may vary.
          </p>
        </section>

        {/* ── Recommended Buyers ───────────────────────────────── */}
        <section className="section">
          <div className="section-header">
            <h2>Buyer Matches</h2>
            {selectedLot && (
              <span className="lot-select-pill">
                Lot #{selectedLot.id || selectedLot.crop_lot_id} · {selectedLot.commodity}
              </span>
            )}
          </div>

          {!selectedLot ? (
            <p className="empty-state">Create or select a crop lot to see buyer matches.</p>
          ) : buyers.length === 0 ? (
            <p className="empty-state">No matching buyers found for this lot.</p>
          ) : (
            <table className="buyer-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Business</th>
                  <th>Type</th>
                  <th>District</th>
                  <th>Max Price (₹/kg)</th>
                  <th>Reliability</th>
                  <th>Score</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {buyers.map((b, i) => (
                  <tr key={b.buyer_id}>
                    <td>{i + 1}</td>
                    <td>
                      <span className="buyer-name">{b.business_name}</span>
                      {b.verified && <span className="buyer-verified">Verified</span>}
                    </td>
                    <td className="buyer-type">{b.buyer_type}</td>
                    <td className="buyer-district-col">{b.district}</td>
                    <td className="buyer-price">₹{b.max_price_per_kg?.toFixed(2)}</td>
                    <td className="buyer-reliability">{b.reliability_score}/100</td>
                    <td className="buyer-score">{b.match_score}%</td>
                    <td>
                      <button className="btn-secondary" onClick={() => sendOffer(b)}>
                        Send Offer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ── My Crop Lots ─────────────────────────────────────── */}
        <section className="section">
          <div className="section-header">
            <h2>My Crop Lots</h2>
          </div>
          {lots.length === 0 ? (
            <p className="empty-state">No lots yet. Create one above to get started.</p>
          ) : (
            <div className="lot-grid">
              {lots.map(lot => {
                const lotId = lot.id || lot.crop_lot_id;
                const isSelected = selectedLot && (selectedLot.id === lotId || selectedLot.crop_lot_id === lotId);
                return (
                  <button
                    className={`lot-item${isSelected ? " selected" : ""}`}
                    key={lotId}
                    onClick={() => selectLot(lot)}
                  >
                    <div className="lot-item-title">
                      #{lotId} · {lot.commodity}
                    </div>
                    <span className="lot-item-detail">{lot.quantity_kg} kg · Grade {lot.quality_grade}</span>
                    <span className="lot-item-detail">{lot.district} · {lot.status || "Available"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <footer>AgriLink — Farmer market-linkage platform</footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
