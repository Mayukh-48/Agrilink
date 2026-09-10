import { useState, useEffect, useCallback } from "react";
import { Users, Handshake, Send, CheckCircle } from "lucide-react";
import { API_BASE } from "../config";

function BuyerMatching({ selectedCropLot, cropLots = [], setActivePage, refreshCropLots }) {
  // Default to the passed-in selectedCropLot, or first in list
  const defaultCrop = selectedCropLot || cropLots[0] || null;

  const [activeCrop, setActiveCrop] = useState(defaultCrop);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQuantity, setOfferQuantity] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);

  // Fetch buyers for a crop lot
  const fetchMatches = useCallback(async (crop) => {
    if (!crop) return;
    setLoading(true);
    setMatches([]);
    setSelectedBuyer(null);
    try {
      const response = await fetch(`${API_BASE}/api/buyers/match/${crop.id}`);
      const data = await response.json();
      if (data.error) {
        setMatches([]);
      } else {
        setMatches(data.matches || []);
      }
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-match on load and when activeCrop changes
  useEffect(() => {
    if (activeCrop) {
      fetchMatches(activeCrop);
    }
  }, [activeCrop, fetchMatches]);

  // Sync if parent updates selectedCropLot
  useEffect(() => {
    if (selectedCropLot) {
      setActiveCrop(selectedCropLot);
    }
  }, [selectedCropLot]);

  const handleCropChange = (e) => {
    const crop = cropLots.find((c) => c.id === Number(e.target.value));
    if (crop) {
      setActiveCrop(crop);
    }
  };

  const selectBuyer = (buyer) => {
    setSelectedBuyer(buyer);
    // Smart pre-fill: buyer's max price if > farmer expected, else farmer's expected
    const smartPrice =
      activeCrop && buyer.max_price_per_kg >= (activeCrop.expected_price || 0)
        ? buyer.max_price_per_kg
        : activeCrop?.expected_price || "";
    setOfferPrice(String(smartPrice));
    setOfferQuantity(String(activeCrop?.quantity_kg || 1000));
  };

  const sendOffer = async (e) => {
    e.preventDefault();
    if (!selectedBuyer || !activeCrop) return;
    setOfferLoading(true);
    try {
      const params = new URLSearchParams({
        crop_lot_id: String(activeCrop.id),
        buyer_id: String(selectedBuyer.buyer_id),
        offered_price_per_kg: String(offerPrice),
        quantity_kg: String(offerQuantity),
      });
      const response = await fetch(
        `${API_BASE}/api/offers?${params.toString()}`,
        { method: "POST" }
      );
      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      alert(
        `Offer sent!\nOffer #${data.id}\nBuyer: ${selectedBuyer.business_name}`
      );
      setSelectedBuyer(null);
      setOfferPrice("");
      setOfferQuantity("");
      // Refresh crop lots so status updates (IN_NEGOTIATION)
      if (refreshCropLots) refreshCropLots();
      // Navigate to Offers tab
      if (setActivePage) setActivePage("Offers");
    } catch {
      alert("Could not send offer.");
    } finally {
      setOfferLoading(false);
    }
  };

  // Generate "why it matched" reasons for a buyer
  const getReasons = (buyer) => {
    if (!activeCrop) return [];
    const reasons = [];
    if (
      activeCrop.district &&
      buyer.district.toLowerCase() === activeCrop.district.toLowerCase()
    ) {
      reasons.push(`✓ Same District (${buyer.district})`);
    }
    if (buyer.max_price_per_kg >= (activeCrop.expected_price || 0)) {
      reasons.push(`✓ Pays ₹${buyer.max_price_per_kg}/kg (above expected)`);
    }
    if (buyer.max_quantity_kg >= (activeCrop.quantity_kg || 0)) {
      reasons.push(`✓ Can buy ${Number(activeCrop.quantity_kg).toLocaleString("en-IN")} kg`);
    }
    if (buyer.reliability_score >= 90) {
      reasons.push(`✓ High Reliability (${buyer.reliability_score}/100)`);
    }
    return reasons.slice(0, 3); // max 3 tags
  };

  return (
    <div className="page-card">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={22} color="#1b4332" /> Buyer Matching
          </h2>
          <p>AI-matched buyers ranked by price, location, quantity & reliability.</p>
        </div>
      </div>

      {/* CROP DROPDOWN */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ fontWeight: "600", fontSize: "13px", color: "#374151", display: "block", marginBottom: "8px" }}
        >
          Select Your Crop
        </label>
        {cropLots.length === 0 ? (
          <p style={{ color: "#6b7280" }}>
            No crop listings found. Add a crop first from Crop Listings.
          </p>
        ) : (
          <select
            value={activeCrop?.id || ""}
            onChange={handleCropChange}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1.5px solid #d1d5db",
              borderRadius: "10px",
              fontSize: "14px",
              background: "white",
              color: "#111827",
              cursor: "pointer",
            }}
          >
            {cropLots.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.commodity} — {Number(crop.quantity_kg).toLocaleString("en-IN")} kg •{" "}
                {crop.district || "Unknown"} • ₹{crop.expected_price}/kg
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ACTIVE CROP BANNER */}
      {activeCrop && (
        <div
          style={{
            background: "#e8f5ee",
            border: "1px solid #b7dfc8",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "20px",
          }}
        >
          <strong style={{ color: "#1b4332" }}>
            {activeCrop.commodity}
          </strong>
          <p style={{ margin: "4px 0 0", color: "#527064", fontSize: "13px" }}>
            {Number(activeCrop.quantity_kg).toLocaleString("en-IN")} kg •{" "}
            {activeCrop.district || "Location not specified"} • Expected ₹
            {activeCrop.expected_price}/kg
          </p>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <p style={{ color: "#6b7280", fontStyle: "italic" }}>
          Finding best buyers...
        </p>
      )}

      {/* NO MATCHES */}
      {!loading && activeCrop && matches.length === 0 && (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: "#6b7280",
            background: "#f9fafb",
            borderRadius: "12px",
          }}
        >
          <Users size={36} color="#d1d5db" style={{ marginBottom: "12px" }} />
          <p>
            No buyers found for <strong>{activeCrop.commodity}</strong>.
          </p>
          <p style={{ fontSize: "13px" }}>
            Buyers in our system currently accept: Onion, Tomato, Potato, Wheat.
          </p>
        </div>
      )}

      {/* BUYER RESULTS */}
      {!loading && matches.length > 0 && (
        <div className="prediction-results">
          <h3 style={{ marginBottom: "14px" }}>
            {matches.length} Recommended Buyer{matches.length > 1 ? "s" : ""}
          </h3>
          <div className="crop-list">
            {matches.map((buyer) => {
              const reasons = getReasons(buyer);
              const isSelected = selectedBuyer?.buyer_id === buyer.buyer_id;
              return (
                <div
                  className="crop-list-item"
                  key={buyer.buyer_id}
                  style={
                    isSelected
                      ? { border: "2px solid #287a49", background: "#f0faf4" }
                      : {}
                  }
                >
                  {/* ICON */}
                  <div className="crop-image">
                    <Handshake size={24} color="#2d6a4f" />
                  </div>

                  {/* BUYER DETAILS */}
                  <div className="crop-info">
                    <h3>{buyer.business_name}</h3>
                    <p style={{ color: "#6b7280", fontSize: "13px" }}>
                      {buyer.buyer_type} • {buyer.district}
                    </p>
                    <p style={{ fontSize: "13px" }}>
                      Up to {Number(buyer.max_quantity_kg).toLocaleString("en-IN")} kg • Max ₹{buyer.max_price_per_kg}/kg
                    </p>
                    {/* WHY IT MATCHED TAGS */}
                    {reasons.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          marginTop: "8px",
                        }}
                      >
                        {reasons.map((r, i) => (
                          <span
                            key={i}
                            style={{
                              background: "#dcf5e7",
                              color: "#1b4332",
                              fontSize: "11px",
                              fontWeight: "600",
                              padding: "3px 8px",
                              borderRadius: "20px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* MATCH SCORE */}
                  <div className="crop-price">
                    <span>Match Score</span>
                    <strong
                      style={{
                        fontSize: "18px",
                        color: buyer.match_score >= 90 ? "#16a34a" : "#d97706",
                      }}
                    >
                      {buyer.match_score}/100
                    </strong>
                  </div>

                  {/* VERIFIED BADGE */}
                  <span className="available">
                    {buyer.verified ? "VERIFIED" : "UNVERIFIED"}
                  </span>

                  {/* SELECT BUTTON */}
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => selectBuyer(buyer)}
                    style={isSelected ? { background: "#287a49" } : {}}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle size={15} /> Selected
                      </>
                    ) : (
                      "Select Buyer"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEND OFFER FORM */}
      {selectedBuyer && (
        <div
          className="page-card"
          style={{ marginTop: "24px", border: "2px solid #287a49" }}
        >
          <div className="page-header">
            <div>
              <h2>
                <Send size={20} style={{ marginRight: "8px", verticalAlign: "text-bottom" }} />
                Send Offer
              </h2>
              <p>
                Sending offer to{" "}
                <strong>{selectedBuyer.business_name}</strong>
              </p>
            </div>
          </div>

          <form className="crop-form" onSubmit={sendOffer}>
            <div className="form-grid">
              <div>
                <label>Offer Price (₹/kg)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="Enter price"
                  required
                />
              </div>
              <div>
                <label>Quantity (kg)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={offerQuantity}
                  onChange={(e) => setOfferQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  required
                />
              </div>
            </div>

            {/* TOTAL VALUE */}
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                background: "#f1f6f2",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Total Offer Value</span>
              <strong style={{ fontSize: "20px", color: "#287a49" }}>
                ₹
                {(
                  Number(offerPrice || 0) * Number(offerQuantity || 0)
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="form-buttons">
              <button
                type="submit"
                className="primary-button"
                disabled={offerLoading}
              >
                {offerLoading ? "Sending..." : "Send Offer"}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setSelectedBuyer(null);
                  setOfferPrice("");
                  setOfferQuantity("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default BuyerMatching;