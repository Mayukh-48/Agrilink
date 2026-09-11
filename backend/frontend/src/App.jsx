import { useEffect, useState } from "react";
import "./App.css";
import { API_BASE } from "./config";

import MarketPrices from "./pages/MarketPrices";
import PricePrediction from "./pages/PricePrediction";
import BuyerMatching from "./pages/BuyerMatching";
import Offers from "./pages/Offers";
import Logistics from "./pages/Logistics";
import Payments from "./pages/Payments";
import Grievances from "./pages/Grievances";
import Login from "./pages/Login";
import BuyerDashboard from "./pages/BuyerDashboard";
import BuyerCropListings from "./pages/BuyerCropListings";
import BuyerOffer from "./pages/BuyerOffer";
import {
  Leaf, LayoutDashboard, List, TrendingUp, LineChart, Users,
  Briefcase, Truck, CreditCard, MessageSquare, LogOut,
  User, Sprout, Banknote, Handshake, Search
} from "lucide-react";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [cropLots, setCropLots] = useState([]);
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedCropLot, setSelectedCropLot] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCropForm, setShowCropForm] = useState(false);
  const [forecastTarget, setForecastTarget] = useState({ commodity: "Onion", mandi: "", price: "" });

  const [cropForm, setCropForm] = useState({
    farmer_id: 1,
    commodity: "",
    quantity_kg: "",
    quality_grade: "",
    district: "",
    harvest_date: "",
    expected_price: "",
  });

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("user_id")
  );

  const [loggedInUser, setLoggedInUser] = useState({
    username: localStorage.getItem("username") || "",
    farmer_id: localStorage.getItem("farmer_id") || "",
    role: localStorage.getItem("role") || "",
  });

  const [stats, setStats] = useState({
    active_crops: 0,
    expected_value: 0,
    buyer_matches: 0,
    completed_sales: 0,
  });

  const fetchCropLots = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/crop-lots`);
      const data = await response.json();
      if (Array.isArray(data)) setCropLots(data);
    } catch (error) {
      console.error("Crop lot error:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/stats`);
      const data = await response.json();
      if (data && !data.error) setStats(data);
    } catch (error) {
      console.error("Dashboard stats error:", error);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((response) => response.json())
      .then((data) => {
        setBackendStatus(data.status);
      })
      .catch(() => {
        setBackendStatus("Offline");
      });

    fetchCropLots();
    fetchStats();
  }, [activePage]);

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
        `${API_BASE}/api/crop-lots?${params.toString()}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        alert(data.error || "Failed to add crop");
        return;
      }

      alert("Crop added successfully!");

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

      await fetchCropLots();
      await fetchStats();
    } catch (error) {
      console.error("Add crop error:", error);
      alert("Could not connect to the backend.");
    }
  };

  const menuItems =
    loggedInUser.role === "BUYER"
      ? [
        "Dashboard",
        "Crop Listings",
        "Offers",
        "Logistics",
        "Payments",
        "Grievances",
      ]
      : [
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
    if (activePage === "Make an Offer" && loggedInUser.role === "BUYER") {
      return (
        <BuyerOffer
          selectedCropLot={selectedCropLot}
          setActivePage={setActivePage}
        />
      );
    }
    if (activePage === "Crop Listings" && loggedInUser.role === "BUYER") {
      return (
        <BuyerCropListings
          cropLots={cropLots}
          setActivePage={setActivePage}
          setSelectedCropLot={setSelectedCropLot}
        />
      );
    }
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

              <p>
                View all crops listed by farmers.
              </p>

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
                <div
                  className="crop-list-item"
                  key={crop.id}
                >

                  <div className="crop-image">
                    <Leaf size={24} color="#2d6a4f" />
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
                      Quality:{" "}
                      {crop.quality_grade || "Not specified"}
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
              ))}

            </div>
          )}

        </div>
      );
    }

    return null;
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);

    setLoggedInUser({
      username: userData.username,
      farmer_id: userData.farmer_id,
      role: userData.role,
    });

    setActivePage("Dashboard");
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">
          <Leaf size={24} color="#95d5b2" />
          <span>KisanLink</span>
        </div>

        <p className="menu-title">MENU</p>

        <nav>

          {menuItems.map((item) => (
            <button
              key={item}
              className={`menu-item ${activePage === item ? "active" : ""
                }`}
              onClick={() => {
                if (item === "Buyer Matching") {
                  setSelectedCropLot(null);
                }

                setActivePage(item);

                // Close crop form when leaving Crop Listings
                if (item !== "Crop Listings") {
                  setShowCropForm(false);
                }
              }}
            >
              {item === "Dashboard" && <LayoutDashboard size={18} />}
              {item === "Crop Listings" && <List size={18} />}
              {item === "Market Prices" && <TrendingUp size={18} />}
              {item === "Price Prediction" && <LineChart size={18} />}
              {item === "Buyer Matching" && <Users size={18} />}
              {item === "Offers" && <Briefcase size={18} />}
              {item === "Logistics" && <Truck size={18} />}
              {item === "Payments" && <CreditCard size={18} />}
              {item === "Grievances" && <MessageSquare size={18} />}
              {item}
            </button>
          ))}

        </nav>

        <div className="sidebar-bottom">

          <p>Smart Farming</p>

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
              <User size={20} />
            </div>

            <div>
              <strong>{loggedInUser.username || "Farmer"}</strong>
              <span>
                {loggedInUser.role || "FARMER"}
              </span>
            </div>

            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                localStorage.removeItem("user_id");
                localStorage.removeItem("username");
                localStorage.removeItem("farmer_id");
                localStorage.removeItem("role");

                setIsLoggedIn(false);
                setLoggedInUser({
                  username: "",
                  farmer_id: "",
                  role: "",
                });
              }}
            >
              Logout
            </button>

          </div>

        </header>

        {/* Dashboard */}
        {activePage === "Dashboard" && loggedInUser.role !== "BUYER" && (
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

                <div className="stat-icon">
                  <Sprout size={24} color="#2d6a4f" />
                </div>

                <div>
                  <span>
                    Active Crop Lots
                  </span>

                  <h2>
                    {stats.active_crops || cropLots.length}
                  </h2>
                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon">
                  <Banknote size={24} color="#2d6a4f" />
                </div>

                <div>

                  <span>
                    Expected Value
                  </span>

                  <h2>
                    ₹
                    {(stats.expected_value || 0).toLocaleString("en-IN")}
                  </h2>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon">
                  <Handshake size={24} color="#2d6a4f" />
                </div>

                <div>

                  <span>
                    Buyer Matches
                  </span>

                  <h2>
                    {stats.buyer_matches || 0}
                  </h2>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon">
                  <Truck size={24} color="#2d6a4f" />
                </div>

                <div>

                  <span>
                    Completed Sales
                  </span>

                  <h2>
                    {stats.completed_sales || 0}
                  </h2>

                </div>

              </div>

            </section>

            {/* Main Cards */}
            <section className="dashboard-grid">

              {/* Crop Listings */}
              <div className="dashboard-card">

                <div className="card-header">

                  <div>

                    <h2>
                      My Crop Listings
                    </h2>

                    <p>
                      Your recently listed crops
                    </p>

                  </div>

                  <button
                    className="primary-button"
                    onClick={() => {
                      setActivePage("Crop Listings");
                      setShowCropForm(true);
                    }}
                  >
                    + Add Crop
                  </button>

                </div>

                <div style={{ marginBottom: "16px", display: "flex", gap: "12px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      placeholder="Search crops or districts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1px solid #d1d5db", borderRadius: "9px", fontSize: "13.5px" }}
                    />
                  </div>
                  <select style={{ padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "9px", fontSize: "13.5px", backgroundColor: "white" }}>
                    <option value="all">All Grades</option>
                    <option value="a">Grade A</option>
                    <option value="b">Grade B</option>
                  </select>
                </div>
                {cropLots.filter(c => c.commodity.toLowerCase().includes(searchQuery.toLowerCase()) || c.district.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <p>
                    No crop listings found.
                  </p>
                ) : (
                  cropLots.filter(c => c.commodity.toLowerCase().includes(searchQuery.toLowerCase()) || c.district.toLowerCase().includes(searchQuery.toLowerCase())).map((crop) => (
                    <div
                      className="crop-item"
                      key={crop.id}
                    >

                      <div className="crop-image">

                        <Leaf size={24} color="#2d6a4f" />

                      </div>

                      <div className="crop-info">

                        <h3>
                          {crop.commodity}
                        </h3>

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
                    <p>Live APMC prices across all crops</p>
                  </div>
                </div>

                <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "12px" }}>
                  View current prices for Onion, Potato, Tomato &amp; Wheat across major mandis.
                </p>

                <button
                  className="primary-button"
                  onClick={() => setActivePage("Market Prices")}
                >
                  View Market Prices
                </button>

              </div>

            </section>

            {/* Quick Actions */}
            <section className="dashboard-card quick-actions">

              <div className="card-header">

                <div>

                  <h2>
                    Quick Actions
                  </h2>

                  <p>
                    Manage your agricultural activities
                  </p>

                </div>

              </div>

              <div className="action-grid">

                {/* List New Crop */}
                <button
                  type="button"
                  onClick={() => {
                    setActivePage("Crop Listings");
                    setShowCropForm(true);
                  }}
                >
                  <Sprout size={32} strokeWidth={1.5} color="#2d6a4f" />
                  <span>
                    List New Crop
                  </span>
                </button>

                {/* Check Market Prices */}
                <button
                  type="button"
                  onClick={() => {
                    setActivePage("Market Prices");
                    setShowCropForm(false);
                  }}
                >
                  <TrendingUp size={32} strokeWidth={1.5} color="#2d6a4f" />
                  <span>
                    Check Market Prices
                  </span>
                </button>

                {/* Predict Future Price */}
                <button
                  type="button"
                  onClick={() => {
                    setActivePage("Price Prediction");
                    setShowCropForm(false);
                  }}
                >
                  <LineChart size={32} strokeWidth={1.5} color="#2d6a4f" />
                  <span>
                    Predict Future Price
                  </span>
                </button>

                {/* Find Buyers */}
                <button
                  type="button"
                  onClick={() => {
                    setActivePage("Buyer Matching");
                    setShowCropForm(false);
                  }}
                >
                  <Users size={32} strokeWidth={1.5} color="#2d6a4f" />
                  <span>
                    Find Buyers
                  </span>
                </button>

              </div>

            </section>

          </>
        )}

        {/* Buyer Dashboard */}
        {activePage === "Dashboard" && loggedInUser.role === "BUYER" && (
          <BuyerDashboard
            cropLots={cropLots}
            setActivePage={setActivePage}
          />
        )}

        {/* Buyer Crop Listings / Buyer Offer / Farmer Crop Listings */}
        {(activePage === "Crop Listings" || activePage === "Make an Offer") && (
          renderPage()
        )}

        {/* Market Prices */}
        {activePage === "Market Prices" && (
          <MarketPrices
            onForecast={(commodity, mandi, price) => {
              setForecastTarget({ commodity, mandi, price: String(price) });
              setActivePage("Price Prediction");
            }}
          />
        )}

        {/* Price Prediction */}
        {activePage === "Price Prediction" && (
          <PricePrediction
            key={`${forecastTarget.commodity}-${forecastTarget.mandi}-${forecastTarget.price}`}
            initialCommodity={forecastTarget.commodity}
            initialMandi={forecastTarget.mandi}
            initialPrice={forecastTarget.price}
          />
        )}

        {/* Buyer Matching */}
        {activePage === "Buyer Matching" && (
          <BuyerMatching
            selectedCropLot={selectedCropLot}
            cropLots={cropLots}
            setActivePage={setActivePage}
            refreshCropLots={() => {
              fetchCropLots();
              fetchStats();
            }}
          />
        )}

        {/* Offers */}
        {activePage === "Offers" && (
          <Offers
            onOffersChange={() => {
              fetchCropLots();
              fetchStats();
            }}
          />
        )}

        {/* Logistics */}
        {activePage === "Logistics" && (
          <Logistics />
        )}

        {/* Payments */}
        {activePage === "Payments" && (
          <Payments />
        )}

        {/* Grievances */}
        {activePage === "Grievances" && (
          <Grievances />
        )}

      </main>
    </div>
  );
}

export default App;