import { useState } from "react";
import {
    Handshake,
    Package,
    IndianRupee,
    MapPin,
    User,
    ArrowLeft,
} from "lucide-react";
import { API_BASE } from "../config";

function BuyerOffer({
    selectedCropLot,
    setActivePage,
    refreshCropLots,
}) {
    const [offerPrice, setOfferPrice] = useState(
        selectedCropLot?.expected_price || ""
    );

    const [offerQuantity, setOfferQuantity] = useState(
        selectedCropLot?.quantity_kg || ""
    );

    const [loading, setLoading] = useState(false);

    if (!selectedCropLot) {
        return (
            <div className="page-card">
                <div className="page-header">
                    <div>
                        <h2>Make an Offer</h2>
                        <p>No crop has been selected.</p>
                    </div>
                </div>

                <button
                    className="primary-button"
                    onClick={() => setActivePage("Crop Listings")}
                >
                    <ArrowLeft size={17} />
                    Browse Crop Listings
                </button>
            </div>
        );
    }

    const totalValue =
        Number(offerPrice || 0) *
        Number(offerQuantity || 0);

    const sendOffer = async (event) => {
        event.preventDefault();

        if (!offerPrice || !offerQuantity) {
            alert("Please enter offer price and quantity.");
            return;
        }

        if (Number(offerPrice) <= 0) {
            alert("Offer price must be greater than 0.");
            return;
        }

        if (Number(offerQuantity) <= 0) {
            alert("Offer quantity must be greater than 0.");
            return;
        }

        if (
            Number(offerQuantity) >
            Number(selectedCropLot.quantity_kg)
        ) {
            alert(
                `You cannot offer more than ${selectedCropLot.quantity_kg} kg.`
            );
            return;
        }

        setLoading(true);

        try {
            const buyerId = localStorage.getItem("buyer_id");

            if (!buyerId) {
                alert(
                    "Buyer account information is missing. Please log in again."
                );
                return;
            }

            const params = new URLSearchParams({
                crop_lot_id: String(selectedCropLot.id),
                buyer_id: String(buyerId),
                offered_price_per_kg: String(offerPrice),
                quantity_kg: String(offerQuantity),
                sender_role: "BUYER",
            });

            const response = await fetch(
                `${API_BASE}/api/offers?${params.toString()}`,
                {
                    method: "POST",
                }
            );

            const data = await response.json();

            if (!response.ok || data.error) {
                alert(data.error || "Could not send offer.");
                return;
            }

            alert(
                `Offer sent successfully!\n\n` +
                `Offer #${data.id}\n` +
                `Crop: ${selectedCropLot.commodity}\n` +
                `Farmer: ${selectedCropLot.farmer_name ||
                `Farmer #${selectedCropLot.farmer_id}`
                }`
            );

            if (refreshCropLots) {
                refreshCropLots();
            }

            setActivePage("Offers");
        } catch (error) {
            console.error("Buyer offer error:", error);
            alert("Could not connect to the backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: "1000px",
                margin: "0 auto",
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                }}
            >
                <div>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "28px",
                            color: "#163c2c",
                        }}
                    >
                        Make an Offer
                    </h2>

                    <p
                        style={{
                            margin: "7px 0 0",
                            color: "#6b7280",
                            fontSize: "15px",
                        }}
                    >
                        Send your purchase offer directly to the farmer.
                    </p>
                </div>

                <button
                    className="secondary-button"
                    onClick={() => setActivePage("Crop Listings")}
                    disabled={loading}
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
            </div>

            {/* CROP INFORMATION */}
            <div
                className="dashboard-card"
                style={{
                    padding: "24px",
                    marginBottom: "20px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        marginBottom: "20px",
                    }}
                >
                    <div
                        style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            background: "#e9f7ef",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Package size={26} color="#2d6a4f" />
                    </div>

                    <div>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: "22px",
                                color: "#163c2c",
                            }}
                        >
                            {selectedCropLot.commodity}
                        </h3>

                        <span
                            style={{
                                color: "#6b7280",
                                fontSize: "14px",
                            }}
                        >
                            Crop Lot #{selectedCropLot.id}
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(4, minmax(0, 1fr))",
                        gap: "16px",
                    }}
                >
                    <div
                        style={{
                            padding: "16px",
                            borderRadius: "12px",
                            background: "#f8faf9",
                        }}
                    >
                        <span
                            style={{
                                display: "block",
                                fontSize: "13px",
                                color: "#6b7280",
                                marginBottom: "6px",
                            }}
                        >
                            Available Quantity
                        </span>

                        <strong style={{ fontSize: "18px" }}>
                            {Number(
                                selectedCropLot.quantity_kg
                            ).toLocaleString("en-IN")}{" "}
                            kg
                        </strong>
                    </div>

                    <div
                        style={{
                            padding: "16px",
                            borderRadius: "12px",
                            background: "#f8faf9",
                        }}
                    >
                        <span
                            style={{
                                display: "block",
                                fontSize: "13px",
                                color: "#6b7280",
                                marginBottom: "6px",
                            }}
                        >
                            Expected Price
                        </span>

                        <strong
                            style={{
                                fontSize: "18px",
                                color: "#2d6a4f",
                            }}
                        >
                            ₹
                            {Number(
                                selectedCropLot.expected_price || 0
                            ).toLocaleString("en-IN")}
                            /kg
                        </strong>
                    </div>

                    <div
                        style={{
                            padding: "16px",
                            borderRadius: "12px",
                            background: "#f8faf9",
                        }}
                    >
                        <span
                            style={{
                                display: "block",
                                fontSize: "13px",
                                color: "#6b7280",
                                marginBottom: "6px",
                            }}
                        >
                            Farmer
                        </span>

                        <strong
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "16px",
                            }}
                        >
                            <User size={16} color="#2d6a4f" />

                            {selectedCropLot.farmer_name ||
                                `Farmer #${selectedCropLot.farmer_id}`}
                        </strong>
                    </div>

                    <div
                        style={{
                            padding: "16px",
                            borderRadius: "12px",
                            background: "#f8faf9",
                        }}
                    >
                        <span
                            style={{
                                display: "block",
                                fontSize: "13px",
                                color: "#6b7280",
                                marginBottom: "6px",
                            }}
                        >
                            Location
                        </span>

                        <strong
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "16px",
                            }}
                        >
                            <MapPin size={16} color="#2d6a4f" />

                            {selectedCropLot.district ||
                                "Not specified"}
                        </strong>
                    </div>
                </div>
            </div>

            {/* OFFER FORM */}
            <div
                className="dashboard-card"
                style={{
                    padding: "28px",
                }}
            >
                <div style={{ marginBottom: "24px" }}>
                    <h3
                        style={{
                            margin: 0,
                            fontSize: "20px",
                            color: "#163c2c",
                        }}
                    >
                        Your Offer
                    </h3>

                    <p
                        style={{
                            margin: "6px 0 0",
                            color: "#6b7280",
                            fontSize: "14px",
                        }}
                    >
                        Enter the price and quantity you want to purchase.
                    </p>
                </div>

                <form onSubmit={sendOffer}>
                    {/* PRICE + QUANTITY */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "24px",
                        }}
                    >
                        {/* OFFER PRICE */}
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#163c2c",
                                    marginBottom: "8px",
                                }}
                            >
                                Offer Price{" "}
                                <span
                                    style={{
                                        fontWeight: "400",
                                        color: "#6b7280",
                                    }}
                                >
                                    (₹ per kg)
                                </span>
                            </label>

                            <div
                                style={{
                                    position: "relative",
                                }}
                            >
                                <span
                                    style={{
                                        position: "absolute",
                                        left: "15px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        fontSize: "18px",
                                        fontWeight: "600",
                                        color: "#2d6a4f",
                                        pointerEvents: "none",
                                    }}
                                >
                                    ₹
                                </span>

                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={offerPrice}
                                    onChange={(e) =>
                                        setOfferPrice(e.target.value)
                                    }
                                    placeholder="Enter price"
                                    required
                                    style={{
                                        width: "100%",
                                        height: "48px",
                                        padding: "0 16px 0 42px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "10px",
                                        fontSize: "16px",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>

                            <span
                                style={{
                                    display: "block",
                                    marginTop: "6px",
                                    fontSize: "12px",
                                    color: "#6b7280",
                                }}
                            >
                                Expected: ₹
                                {Number(
                                    selectedCropLot.expected_price || 0
                                ).toLocaleString("en-IN")}
                                /kg
                            </span>
                        </div>

                        {/* QUANTITY */}
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#163c2c",
                                    marginBottom: "8px",
                                }}
                            >
                                Quantity{" "}
                                <span
                                    style={{
                                        fontWeight: "400",
                                        color: "#6b7280",
                                    }}
                                >
                                    (kg)
                                </span>
                            </label>

                            <input
                                type="number"
                                min="1"
                                step="1"
                                max={selectedCropLot.quantity_kg}
                                value={offerQuantity}
                                onChange={(e) =>
                                    setOfferQuantity(e.target.value)
                                }
                                placeholder="Enter quantity"
                                required
                                style={{
                                    width: "100%",
                                    height: "48px",
                                    padding: "0 16px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "10px",
                                    fontSize: "16px",
                                    boxSizing: "border-box",
                                }}
                            />

                            <span
                                style={{
                                    display: "block",
                                    marginTop: "6px",
                                    fontSize: "12px",
                                    color: "#6b7280",
                                }}
                            >
                                Maximum available:{" "}
                                {Number(
                                    selectedCropLot.quantity_kg
                                ).toLocaleString("en-IN")}{" "}
                                kg
                            </span>
                        </div>
                    </div>

                    {/* TOTAL */}
                    <div
                        style={{
                            marginTop: "28px",
                            padding: "20px 24px",
                            borderRadius: "12px",
                            background: "#edf8f1",
                            border: "1px solid #cce8d7",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div>
                            <span
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    color: "#527060",
                                    marginBottom: "4px",
                                }}
                            >
                                Total Offer Value
                            </span>

                            <strong
                                style={{
                                    fontSize: "28px",
                                    color: "#1b4332",
                                }}
                            >
                                ₹
                                {Number(totalValue).toLocaleString(
                                    "en-IN"
                                )}
                            </strong>
                        </div>

                        <div
                            style={{
                                textAlign: "right",
                                color: "#527060",
                                fontSize: "13px",
                            }}
                        >
                            <strong>
                                {Number(
                                    offerQuantity || 0
                                ).toLocaleString("en-IN")}{" "}
                                kg
                            </strong>

                            <br />

                            × ₹
                            {Number(
                                offerPrice || 0
                            ).toLocaleString("en-IN")}
                            /kg
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "12px",
                            marginTop: "26px",
                        }}
                    >
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                setActivePage("Crop Listings")
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            <Handshake size={17} />

                            {loading
                                ? "Sending..."
                                : "Send Offer to Farmer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BuyerOffer;