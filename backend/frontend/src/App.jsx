import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [cropLots, setCropLots] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [activePage, setActivePage] = useState("Dashboard");
  const [showCropForm, setShowCropForm] = useState(false);

const [cropForm, setCropForm] = useState({
  farmer_id: 1,
  commodity: "",
  quantity_kg: "",
  quality_grade: "",
  district: "",
  harvest_date: "",
  expected_price: "",
});

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

  const handleCropChange = (event) => {
  const { name, value } = event.target;

  setCropForm((previous) => ({
    ...previous,
    [name]: value,
  }));
};

const addCrop = async (event) => {
  event.preventDefault();

  try {
    const params = new URLSearchParams({
      farmer_id: cropForm.farmer_id,
      commodity: cropForm.commodity,
      quantity_kg: cropForm.quantity_kg,
      quality_grade: cropForm.quality_grade,
      district: cropForm.district,
      harvest_date: cropForm.harvest_date,
      expected_price: cropForm.expected_price,
    });

    const response = await fetch(
      `http://127.0.0.1:8000/api/crop-lots?${params.toString()}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      alert(data.error || "Failed to add crop");
      return;
    }

    alert("Crop added successfully! 🌾");

    setShowCropForm(false);

    setCropForm({
      farmer_id: 1,
      commodity: "",
      quantity_kg: "",
      quality_grade: "",
      district: "",
      harvest_date: "",
      expected_price: "",
    });

    const cropResponse = await fetch(
      "http://127.0.0.1:8000/api/crop-lots"
    );

    const cropData = await cropResponse.json();

    setCropLots(cropData);
  } catch (error) {
    console.error("Add crop error:", error);
    alert("Could not connect to the backend.");
  }
};
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

  const renderPage = () => {
    if (activePage === "Crop Listings") {
      return (
        <div className="page-card">
          <div className="page-header">
            <div>
              {showCropForm && (
  <form className="crop-form" onSubmit={addCrop}>

    <h3>Add New Crop</h3>

    <div className="form-grid">

      <div>
        <label>Commodity</label>
        <input
          name="commodity"
          value={cropForm.commodity}
          onChange={handleCropChange}
          placeholder="e.g. Onion"
          required
        />
      </div>

      <div>
        <label>Quantity (kg)</label>
        <input
          name="quantity_kg"
          type="number"
          value={cropForm.quantity_kg}
          onChange={handleCropChange}
          placeholder="e.g. 1000"
          required
        />
      </div>

      <div>
        <label>Quality Grade</label>
        <input
          name="quality_grade"
          value={cropForm.quality_grade}
          onChange={handleCropChange}
          placeholder="e.g. A"
        />
      </div>

      <div>
        <label>District</label>
        <input
          name="district"
          value={cropForm.district}
          onChange={handleCropChange}
          placeholder="e.g. Nashik"
          required
        />
      </div>

      <div>
        <label>Harvest Date</label>
        <input
          name="harvest_date"
          type="date"
          value={cropForm.harvest_date}
          onChange={handleCropChange}
          required
        />
      </div>

      <div>
        <label>Expected Price (₹/kg)</label>
        <input
          name="expected_price"
          type="number"
          step="0.01"
          value={cropForm.expected_price}
          onChange={handleCropChange}
          placeholder="e.g. 32"
          required
        />
      </div>

    </div>

    <div className="form-buttons">

      <button
        type="submit"
        className="primary-button"
      >
        Save Crop
      </button>

      <button
        type="button"
        className="cancel-button"
        onClick={() => setShowCropForm(false)}
      >
        Cancel
      </button>

    </div>

  </form>
)}
              <h2>Crop Listings</h2>
              <p>View all crops listed by farmers.</p>
            </div>

            <button
              className="primary-button"
              onClick={() => setShowCropForm(true)}
            >
              + Add Crop
            </button>
          </div>

          {cropLots.length === 0 ? (
            <p>No crop listings found.</p>
          ) : (
            <div className="crop-list">
              {cropLots.map((crop) => (
                <div className="crop-list-item" key={crop.id}>
                  <div className="crop-image">
                    {crop.commodity.toLowerCase() === "onion"
                      ? "🧅"
                      : "🌾"}
                  </div>

                  <div className="crop-info">
                    <h3>{crop.commodity}</h3>

                    <p>
                      Quantity: {crop.quantity_kg} kg
                    </p>

                    <p>
                      District: {crop.district}
                    </p>

                    <p>
                      Quality: {crop.quality_grade || "Not specified"}
                    </p>
                  </div>

                  <div className="crop-price">
                    <span>Expected Price</span>
                    <strong>
                      ₹{crop.expected_price}/kg
                    </strong>
                  </div>

                  <span className="available">
                    {crop.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

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
              className={`menu-item ${activePage === item ? "active" : ""
                }`}
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p>🌱 Smart Farming</p>
          <small>
            Connecting farmers with better markets
          </small>
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
            <div className="profile-icon">
              👨‍🌾
            </div>

            <div>
              <strong>Farmer</strong>
              <span>Demo Account</span>
            </div>
          </div>
        </header>

        {/* Dashboard */}
        {activePage === "Dashboard" && (
          <>
            {/* Status */}
            <div className="status-bar">
              <span>Backend Status</span>

              <strong
                className={
                  backendStatus === "OK"
                    ? "online"
                    : "offline"
                }
              >
                ● {backendStatus}
              </strong>
            </div>

            {/* Statistics */}
            <section className="stats-grid">

              <div className="stat-card">
                <div className="stat-icon">🌾</div>

                <div>
                  <span>Active Crop Lots</span>
                  <h2>{cropLots.length}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>

                <div>
                  <span>Expected Value</span>

                  <h2>
                    ₹
                    {cropLots
                      .reduce(
                        (total, crop) =>
                          total +
                          (crop.quantity_kg || 0) *
                          (crop.expected_price || 0),
                        0
                      )
                      .toLocaleString("en-IN")}
                  </h2>
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

              {/* Crop Listings */}
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
                    <div
                      className="crop-item"
                      key={crop.id}
                    >

                      <div className="crop-image">
                        {crop.commodity
                          .toLowerCase() === "onion"
                          ? "🧅"
                          : "🌾"}
                      </div>

                      <div className="crop-info">
                        <h3>{crop.commodity}</h3>

                        <p>
                          {crop.quantity_kg} kg •{" "}
                          {crop.district}
                        </p>
                      </div>

                      <div className="crop-price">
                        <span>
                          Expected Price
                        </span>

                        <strong>
                          ₹{crop.expected_price}/kg
                        </strong>
                      </div>

                      <span className="available">
                        {crop.status}
                      </span>

                    </div>
                  ))
                )}

              </div>

              {/* Market Snapshot */}
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
                    <div
                      className="market-row"
                      key={market.id}
                    >
                      <span>
                        {market.market_name}
                      </span>

                      <strong>
                        ₹{market.modal_price}/kg
                      </strong>
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
                  <p>
                    Manage your agricultural activities
                  </p>
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
          </>
        )}

        {/* Other Pages */}
        {activePage !== "Dashboard" && (
          <>
            {renderPage()}

            {activePage !== "Crop Listings" && (
              <div className="page-card">
                <h2>{activePage}</h2>

                <p>
                  This section is coming next. 🚀
                </p>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}

export default App;