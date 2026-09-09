import {
    Leaf,
    Sprout,
    Banknote,
    Handshake,
    Truck,
    CreditCard,
    Search,
} from "lucide-react";

function BuyerDashboard({ cropLots, setActivePage }) {
    const availableQuantity = cropLots.reduce(
        (total, crop) => total + (crop.quantity_kg || 0),
        0
    );

    return (
        <>
            {/* Buyer Status */}
            <div className="status-bar">
                <span>Buyer Account</span>

                <strong className="online">
                    ● Active
                </strong>
            </div>

            {/* Buyer Statistics */}
            <section className="stats-grid">

                <div className="stat-card">
                    <div className="stat-icon">
                        <Sprout size={24} color="#2d6a4f" />
                    </div>

                    <div>
                        <span>Available Crop Lots</span>
                        <h2>{cropLots.length}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Banknote size={24} color="#2d6a4f" />
                    </div>

                    <div>
                        <span>Available Quantity</span>

                        <h2>
                            {availableQuantity.toLocaleString("en-IN")}
                            <small
                                style={{
                                    fontSize: "12px",
                                    marginLeft: "4px",
                                }}
                            >
                                kg
                            </small>
                        </h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Handshake size={24} color="#2d6a4f" />
                    </div>

                    <div>
                        <span>My Offers</span>
                        <h2>0</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Truck size={24} color="#2d6a4f" />
                    </div>

                    <div>
                        <span>Completed Purchases</span>
                        <h2>0</h2>
                    </div>
                </div>

            </section>

            {/* Main Buyer Cards */}
            <section className="dashboard-grid">

                {/* Available Produce */}
                <div className="dashboard-card">

                    <div className="card-header">
                        <div>
                            <h2>Available Produce</h2>
                            <p>Browse produce listed by farmers</p>
                        </div>

                        <button
                            className="primary-button"
                            onClick={() => setActivePage("Crop Listings")}
                        >
                            <Search size={16} />
                            Browse Crops
                        </button>
                    </div>

                    <div className="crop-list">

                        {cropLots.slice(0, 4).map((crop) => (
                            <div
                                className="crop-item"
                                key={crop.id}
                            >

                                <div className="crop-image">
                                    <Leaf size={24} color="#2d6a4f" />
                                </div>

                                <div className="crop-info">
                                    <h3>{crop.commodity}</h3>

                                    <p>
                                        {crop.quantity_kg} kg • {crop.district}
                                    </p>

                                    <p>
                                        Quality:{" "}
                                        {crop.quality_grade || "Not specified"}
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

                        {cropLots.length === 0 && (
                            <p>No produce is currently available.</p>
                        )}

                    </div>

                </div>

                {/* Buyer Actions */}
                <div className="dashboard-card">

                    <div className="card-header">
                        <div>
                            <h2>Buyer Actions</h2>
                            <p>Manage your procurement activities</p>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >

                        <button
                            className="primary-button"
                            style={{
                                width: "100%",
                                justifyContent: "center",
                            }}
                            onClick={() => setActivePage("Crop Listings")}
                        >
                            <Search size={17} />
                            Browse Available Crops
                        </button>

                        <button
                            className="primary-button"
                            style={{
                                width: "100%",
                                justifyContent: "center",
                            }}
                            onClick={() => setActivePage("Offers")}
                        >
                            <Handshake size={17} />
                            View My Offers
                        </button>

                        <button
                            className="primary-button"
                            style={{
                                width: "100%",
                                justifyContent: "center",
                            }}
                            onClick={() => setActivePage("Logistics")}
                        >
                            <Truck size={17} />
                            Track Logistics
                        </button>

                        <button
                            className="primary-button"
                            style={{
                                width: "100%",
                                justifyContent: "center",
                            }}
                            onClick={() => setActivePage("Payments")}
                        >
                            <CreditCard size={17} />
                            View Payments
                        </button>

                    </div>

                </div>

            </section>

            {/* Buyer Quick Actions */}
            <section className="dashboard-card quick-actions">

                <div className="card-header">
                    <div>
                        <h2>Quick Actions</h2>
                        <p>Quickly access your procurement tools</p>
                    </div>
                </div>

                <div className="action-grid">

                    <button
                        type="button"
                        onClick={() => setActivePage("Crop Listings")}
                    >
                        <Search
                            size={32}
                            strokeWidth={1.5}
                            color="#2d6a4f"
                        />

                        <span>Browse Crops</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActivePage("Offers")}
                    >
                        <Handshake
                            size={32}
                            strokeWidth={1.5}
                            color="#2d6a4f"
                        />

                        <span>My Offers</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActivePage("Logistics")}
                    >
                        <Truck
                            size={32}
                            strokeWidth={1.5}
                            color="#2d6a4f"
                        />

                        <span>Track Orders</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActivePage("Payments")}
                    >
                        <CreditCard
                            size={32}
                            strokeWidth={1.5}
                            color="#2d6a4f"
                        />

                        <span>Payments</span>
                    </button>

                </div>

            </section>
        </>
    );
}

export default BuyerDashboard;