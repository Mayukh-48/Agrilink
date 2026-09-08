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
  const [form, setForm] = useState({
    commodity: "Onion", quantity_kg: 5000, quality_grade: "A",
    district: "Nashik", harvest_date: "", expected_price: ""
  });

  async function loadData() {
    const [p, f, l] = await Promise.all([
      axios.get(`${API}/market/prices?commodity=${commodity}`),
      axios.get(`${API}/prediction/price?commodity=${commodity}&district=${district}`),
      axios.get(`${API}/lots`)
    ]);
    setPrices(p.data); setForecast(f.data); setLots(l.data);
  }

  useEffect(() => { loadData().catch(console.error); }, [commodity, district]);

  async function addLot(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        quantity_kg: Number(form.quantity_kg),
        expected_price: form.expected_price ? Number(form.expected_price) : null
      };
      const res = await axios.post(`${API}/lots`, payload);
      setLots(prev => [res.data, ...prev]);
      setSelectedLot(res.data);
      const b = await axios.get(`${API}/buyers/recommended/${res.data.id}`);
      setBuyers(b.data);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not create lot");
    } finally { setLoading(false); }
  }

  async function selectLot(lot) {
    setSelectedLot(lot);
    const b = await axios.get(`${API}/buyers/recommended/${lot.id}`);
    setBuyers(b.data);
  }

  async function sendOffer(buyer) {
    if (!selectedLot) return;
    await axios.post(`${API}/offers`, {
      lot_id: selectedLot.id,
      buyer_name: buyer.name,
      price_per_kg: buyer.price_per_kg,
      quantity_kg: selectedLot.quantity_kg
    });
    alert(`Offer sent to ${buyer.name}`);
  }

  const chartData = (forecast?.forecast || []).map((price, i) => ({ day: `Day ${i + 1}`, price }));

  return (
    <div>
      <header className="topbar">
        <div>
          <div className="brand">🌾 AgriLink</div>
          <div className="tagline">Right Price. Right Buyer. Right Time.</div>
        </div>
        <div className="language">English · मराठी · हिंदी</div>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">FARMER MARKET INTELLIGENCE</p>
            <h1>Sell smarter, not just faster.</h1>
            <p className="heroText">
              Compare markets, forecast prices, discover verified buyers and estimate your net realization.
            </p>
          </div>
          <div className="heroCard">
            <span>Best market today</span>
            <strong>{prices[0]?.apmc || "Loading..."}</strong>
            <b>₹{prices[0]?.modal_price?.toFixed(2) || "--"} / kg</b>
          </div>
        </section>

        <div className="grid">
          <section className="card">
            <h2>1. Create Crop Lot</h2>
            <form onSubmit={addLot}>
              <label>Commodity</label>
              <select value={form.commodity} onChange={e => {
                setForm({...form, commodity:e.target.value}); setCommodity(e.target.value);
              }}>
                <option>Onion</option><option>Tomato</option>
              </select>

              <label>Quantity (kg)</label>
              <input type="number" min="1" value={form.quantity_kg}
                onChange={e => setForm({...form, quantity_kg:e.target.value})}/>

              <label>Quality Grade</label>
              <select value={form.quality_grade}
                onChange={e => setForm({...form, quality_grade:e.target.value})}>
                <option>A</option><option>B</option><option>C</option>
              </select>

              <label>District</label>
              <select value={form.district} onChange={e => {
                setForm({...form, district:e.target.value}); setDistrict(e.target.value);
              }}>
                <option>Nashik</option><option>Pune</option><option>Mumbai</option><option>Ahmednagar</option>
              </select>

              <label>Harvest Date</label>
              <input type="date" value={form.harvest_date}
                onChange={e => setForm({...form, harvest_date:e.target.value})}/>

              <button disabled={loading}>{loading ? "Creating..." : "Create Lot & Find Buyers"}</button>
            </form>
          </section>

          <section className="card">
            <div className="sectionTitle">
              <h2>2. Market Prices</h2>
              <select value={commodity} onChange={e => setCommodity(e.target.value)}>
                <option>Onion</option><option>Tomato</option>
              </select>
            </div>
            <div className="priceList">
              {prices.map(p => (
                <div className="priceRow" key={p.id}>
                  <div><strong>{p.apmc}</strong><small>{p.district} · Arrival {p.arrival_quantity} T</small></div>
                  <strong>₹{p.modal_price.toFixed(2)}/kg</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="card">
          <h2>3. AI Price Forecast</h2>
          <div className="forecastTop">
            <div><small>Current price</small><div className="bigNumber">₹{forecast?.current_price?.toFixed(2) || "--"}/kg</div></div>
            <div className="recommendation">🟢 {forecast?.recommendation || "Loading"}</div>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" /><YAxis /><Tooltip />
                <Line type="monotone" dataKey="price" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="note">Demo forecast only. Replace this endpoint with your trained XGBoost model.</p>
        </section>

        <section className="card">
          <div className="sectionTitle">
            <h2>4. Recommended Buyers</h2>
            {selectedLot && <span className="pill">Lot #{selectedLot.id}</span>}
          </div>
          {!selectedLot && <p className="muted">Create a crop lot to see buyer recommendations.</p>}
          {buyers.map((b, i) => (
            <div className={`buyer ${i === 0 ? "best" : ""}`} key={b.id}>
              <div className="rank">{i + 1}</div>
              <div className="buyerMain">
                <div className="buyerName">{b.name} {b.verified && <span className="verified">✓ Verified</span>}</div>
                <small>{b.district} · {b.distance_km} km · Reliability {b.reliability}/100</small>
              </div>
              <div className="buyerMoney"><strong>₹{b.price_per_kg.toFixed(2)}/kg</strong><small>Net ₹{b.net_realization.toLocaleString()}</small></div>
              <div className="score">{b.score}%</div>
              <button className="secondary" onClick={() => sendOffer(b)}>Send Offer</button>
            </div>
          ))}
        </section>

        <section className="card">
          <h2>5. My Crop Lots</h2>
          {lots.length === 0 ? <p className="muted">No lots yet.</p> :
            <div className="lotGrid">
              {lots.map(lot => (
                <button className="lot" key={lot.id} onClick={() => selectLot(lot)}>
                  <strong>#{lot.id} · {lot.commodity}</strong>
                  <span>{lot.quantity_kg} kg · Grade {lot.quality_grade}</span>
                  <span>{lot.district}</span>
                </button>
              ))}
            </div>}
        </section>

        <footer>AgriLink MVP · Farmer market-linkage platform</footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
