import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [cropLots, setCropLots] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [activePage, setActivePage] = useState("Dashboard");

  useEffect(() => {
  fetch("http://127.0.0.1:8000/api/health")
    .then((response) => response.json())
    .then((data) => {
      setBackendStatus(data.status);
    })
    .catch(() => {
      setBackendStatus("Offline");
    });

  fetch("http://127.0.0.1:8000/api/crop-lots")
    .then((response) => response.json())
    .then((data) => {
      setCropLots(data);
    })
    .catch((error) => {
      console.error("Crop lot error:", error);
    });

  fetch("http://127.0.0.1:8000/api/market/prices?commodity=Onion")
  .then((response) => response.json())
  .then((data) => {
    setMarketPrices(data);
  })
  .catch((error) => {
    console.error("Market price error:", error);
  });
}, []);

  const menuItems = [
    "Dashboard",
    "Crop Listings",
    "Market Prices",
    "Price Prediction",
    "Buyer Matching",
    "Offers",
    "Logistics",
    "Payments",
    "Grievances",
  ];

  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">
          🌾 <span>AgriLink</span>
        </div>

        <p className="menu-title">MENU</p>

        <nav>
        {menuItems.map((item) => (
          <button
            key={item}
            className={`menu-item ${activePage === item ? "active" : ""}`}
            onClick={() => setActivePage(item)}
          >
            {item}
          </button>
        ))}
        </nav>

        <div className="sidebar-bottom">
          <p>🌱 Smart Farming</p>
          <small>Connecting farmers with better markets</small>
        </div>

      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Header */}
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>
  {activePage === "Dashboard"
    ? "Welcome back! Here's what's happening with your crops."
    : `Manage your ${activePage.toLowerCase()} here.`}
</p>
          </div>

          <div className="profile">
            <div className="profile-icon">👨‍🌾</div>
            <div>
              <strong>Farmer</strong>
              <span>Demo Account</span>
            </div>
          </div>
        </header>

        {/* Status */}
        <div className="status-bar">
          <span>Backend Status</span>

          <strong className={backendStatus === "OK" ? "online" : "offline"}>
            ● {backendStatus}
          </strong>
        </div>

        {/* Statistics */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">🌾</div>
            <div>
              <span>Active Crop Lots</span>
              <h2>1</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div>
              <span>Expected Value</span>
              <h2>₹32,000</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🤝</div>
            <div>
              <span>Buyer Matches</span>
              <h2>2</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div>
              <span>Completed Sales</span>
              <h2>1</h2>
            </div>
          </div>

        </section>

        {/* Main Cards */}
        <section className="dashboard-grid">

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <h2>My Crop Listings</h2>
                <p>Your recently listed crops</p>
              </div>

              <button className="primary-button">
                + Add Crop
              </button>
            </div>

            {cropLots.length === 0 ? (
  <p>No crop listings found.</p>
) : (
  cropLots.map((crop) => (
    <div className="crop-item" key={crop.id}>

      <div className="crop-image">
        {crop.commodity.toLowerCase() === "onion" ? "🧅" : "🌾"}
      </div>

      <div className="crop-info">
        <h3>{crop.commodity}</h3>
        <p>
          {crop.quantity_kg} kg • {crop.district}
        </p>
      </div>

      <div className="crop-price">
        <span>Expected Price</span>
        <strong>₹{crop.expected_price}/kg</strong>
      </div>

      <span className="available">
        {crop.status}
      </span>

    </div>
  ))
)}
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <h2>Market Snapshot</h2>
                <p>Current onion prices</p>
              </div>
            </div>

            {marketPrices.length === 0 ? (
  <p>No market prices found.</p>
) : (
  marketPrices.map((market) => (
    <div className="market-row" key={market.id}>
      <span>{market.market_name}</span>
      <strong>₹{market.modal_price}/kg</strong>
    </div>
  ))
)}

</div>

        </section>

        {/* Quick Actions */}
        <section className="dashboard-card quick-actions">

          <div className="card-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Manage your agricultural activities</p>
            </div>
          </div>

          <div className="action-grid">

            <button>
              🌾
              <span>List New Crop</span>
            </button>

            <button>
              📊
              <span>Check Market Prices</span>
            </button>

            <button>
              🤖
              <span>Predict Future Price</span>
            </button>

            <button>
              🤝
              <span>Find Buyers</span>
            </button>

          </div>

        </section>

      </main>
    </div>
  );
}

export default App;