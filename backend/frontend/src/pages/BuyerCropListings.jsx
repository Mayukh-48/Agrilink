import {
    Search,
    Leaf,
    MapPin,
    Package,
    IndianRupee,
    Handshake,
} from "lucide-react";
import { useMemo, useState } from "react";

function BuyerCropListings({
    cropLots,
    setActivePage,
    setSelectedCropLot,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCrop, setSelectedCrop] = useState(null);

    const availableCrops = useMemo(() => {
        return cropLots.filter(
            (crop) =>
                crop.status === "AVAILABLE" &&
                (
                    crop.commodity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    crop.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    crop.quality_grade?.toLowerCase().includes(searchTerm.toLowerCase())
                )
        );
    }, [cropLots, searchTerm]);

    return (
        <>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Crop Listings</h1>
                    <p>Browse fresh produce available from farmers</p>
                </div>
            </div>

            {/* Search */}
            <div className="dashboard-card" style={{ marginBottom: "24px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <Search size={20} color="#2d6a4f" />

                    <input
                        type="text"
                        placeholder="Search by crop, district or quality..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: "15px",
                            background: "transparent",
                        }}
                    />
                </div>
            </div>

            {/* Crop Listings */}
            <section className="dashboard-card">
                <div className="card-header">
                    <div>
                        <h2>Available Produce</h2>
                        <p>
                            {availableCrops.length} crop lot
                            {availableCrops.length !== 1 ? "s" : ""} available
                        </p>
                    </div>
                </div>

                {availableCrops.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "50px 20px",
                            color: "#6b7280",
                        }}
                    >
                        <Leaf
                            size={42}
                            strokeWidth={1.5}
                            color="#95d5b2"
                            style={{ marginBottom: "12px" }}
                        />

                        <h3 style={{ marginBottom: "6px", color: "#192a21" }}>
                            No crops found
                        </h3>

                        <p>
                            Try another search or check back later for new listings.
                        </p>
                    </div>
                ) : (
                    <div className="crop-list">
                        {availableCrops.map((crop) => (
                            <div className="crop-item" key={crop.id}>
                                {/* Crop Icon */}
                                <div className="crop-image">
                                    <Leaf size={26} color="#2d6a4f" />
                                </div>

                                {/* Crop Details */}
                                <div className="crop-info">
                                    <h3>{crop.commodity}</h3>

                                    <p>
                                        <Package size={14} style={{ verticalAlign: "middle" }} />{" "}
                                        {Number(crop.quantity_kg).toLocaleString("en-IN")} kg
                                    </p>

                                    <p>
                                        <MapPin size={14} style={{ verticalAlign: "middle" }} />{" "}
                                        {crop.district || "Location not specified"}
                                    </p>

                                    <p>
                                        Quality: {crop.quality_grade || "Not specified"}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="crop-price">
                                    <span>Expected Price</span>

                                    <strong>
                                        ₹{Number(crop.expected_price || 0).toLocaleString("en-IN")}
                                        /kg
                                    </strong>
                                </div>

                                {/* Status */}
                                <span className="available">AVAILABLE</span>

                                {/* View Button */}
                                <button
                                    className="primary-button"
                                    onClick={() => setSelectedCrop(crop)}
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Crop Details Modal */}
            {selectedCrop && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        zIndex: 1000,
                    }}
                    onClick={() => setSelectedCrop(null)}
                >
                    <div
                        className="dashboard-card"
                        style={{
                            width: "100%",
                            maxWidth: "520px",
                            margin: 0,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-header">
                            <div>
                                <h2>{selectedCrop.commodity}</h2>
                                <p>Crop Lot #{selectedCrop.id}</p>
                            </div>

                            <span className="available">AVAILABLE</span>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "16px",
                                marginTop: "20px",
                            }}
                        >
                            <div>
                                <span>Quantity</span>
                                <strong style={{ display: "block", marginTop: "4px" }}>
                                    {Number(selectedCrop.quantity_kg).toLocaleString("en-IN")} kg
                                </strong>
                            </div>

                            <div>
                                <span>Expected Price</span>
                                <strong style={{ display: "block", marginTop: "4px" }}>
                                    ₹
                                    {Number(
                                        selectedCrop.expected_price || 0
                                    ).toLocaleString("en-IN")}
                                    /kg
                                </strong>
                            </div>

                            <div>
                                <span>Quality</span>
                                <strong style={{ display: "block", marginTop: "4px" }}>
                                    {selectedCrop.quality_grade || "Not specified"}
                                </strong>
                            </div>

                            <div>
                                <span>District</span>
                                <strong style={{ display: "block", marginTop: "4px" }}>
                                    {selectedCrop.district || "Not specified"}
                                </strong>
                            </div>

                            <div>
                                <span>Harvest Date</span>
                                <strong style={{ display: "block", marginTop: "4px" }}>
                                    {selectedCrop.harvest_date || "Not specified"}
                                </strong>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                marginTop: "28px",
                            }}
                        >
                            <button
                                className="primary-button"
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                }}
                                onClick={() => {
                                    setSelectedCropLot(selectedCrop);
                                    setSelectedCrop(null);
                                    setActivePage("Buyer Matching");
                                }}
                            >
                                <Handshake size={17} />
                                Make an Offer
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedCrop(null)}
                                style={{
                                    flex: 1,
                                    padding: "11px 16px",
                                    border: "1px solid #d9e2dc",
                                    borderRadius: "10px",
                                    background: "white",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default BuyerCropListings;