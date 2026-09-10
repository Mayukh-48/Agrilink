import { useState, useEffect } from "react";
import { Users, Handshake, Send } from "lucide-react";
import { API_BASE } from "../config";

function BuyerMatching({ selectedCropLot }) {
  const [cropLotId, setCropLotId] = useState(
    selectedCropLot?.id || 1
  );
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQuantity, setOfferQuantity] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  useEffect(() => {
    if (selectedCropLot) {
      setOfferPrice(selectedCropLot.expected_price || "");
      setOfferQuantity(selectedCropLot.quantity_kg || "");
    }
  }, [selectedCropLot]);

  // Find matching buyers
  const findBuyers = async (event) => {
    event.preventDefault();
    console.log("Find Best Buyers clicked. Crop Lot ID:", cropLotId);

    setLoading(true);
    setMatches([]);
    setSelectedBuyer(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/buyers/match/${cropLotId}`
      );

      const data = await response.json();
      console.log("Buyer matching API response:", data);

      if (data.error) {
        alert(data.error);
        return;
      }

      setMatches(data.matches || []);

      // Use crop quantity returned by backend
      if (data.quantity_kg) {
        setOfferQuantity(String(data.quantity_kg));
      }
    } catch (error) {
      console.error("Buyer matching error:", error);
      alert("Could not connect to buyer matching API.");
    } finally {
      setLoading(false);
    }
  };

  // Select a buyer
  const selectBuyer = (buyer) => {
    console.log("Selected buyer:", buyer);

    setSelectedBuyer(buyer);

    // Default offer price = buyer's maximum price
    setOfferPrice(String(buyer.max_price_per_kg || ""));

    // Default quantity
    setOfferQuantity("1000");
  };

  // Send offer to selected buyer
  const sendOffer = async (event) => {
    event.preventDefault();

    if (!selectedBuyer) {
      alert("Please select a buyer first.");
      return;
    }

    if (!offerPrice || !offerQuantity) {
      alert("Please enter price and quantity.");
      return;
    }

    setOfferLoading(true);

    try {
      const params = new URLSearchParams({
        crop_lot_id: String(cropLotId),
        buyer_id: String(selectedBuyer.buyer_id),
        offered_price_per_kg: String(offerPrice),
        quantity_kg: String(offerQuantity),
      });

      const response = await fetch(
        `${API_BASE}/api/offers?${params.toString()}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      alert(
        `Offer sent successfully!\nOffer #${data.id}\nBuyer: ${selectedBuyer.business_name}`
      );

      // Clear offer form
      setSelectedBuyer(null);
      setOfferPrice("");
      setOfferQuantity("");
    } catch (error) {
      console.error("Offer creation error:", error);
      alert("Could not send offer.");
    } finally {
      setOfferLoading(false);
    }
  };

  return (
    <div className="page-card">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={22} color="#1b4332" /> Buyer Matching</h2>
          <p>Find buyers that best match your crop.</p>
        </div>
      </div>

      {selectedCropLot && (
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
            Selected Crop: {selectedCropLot.commodity}
          </strong>

          <p style={{ margin: "6px 0 0", color: "#527064" }}>
            {selectedCropLot.quantity_kg} kg •{" "}
            {selectedCropLot.district || "Location not specified"} •{" "}
            Expected ₹{selectedCropLot.expected_price || 0}/kg
          </p>
        </div>
      )}

      {/* FIND BUYERS FORM */}
      <form className="crop-form" onSubmit={findBuyers}>
        <div className="form-grid">

          <div>
            <label>Crop Lot ID</label>

            <input
              type="number"
              min="1"
              value={cropLotId}
              onChange={(event) => setCropLotId(event.target.value)}
              required
              readOnly={!!selectedCropLot}
            />
          </div>

        </div>

        <div className="form-buttons">
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Finding Buyers..." : "Find Best Buyers"}
          </button>
        </div>
      </form>

      {/* BUYER RESULTS */}
      {matches.length > 0 && (
        <div className="prediction-results">

          <h3>Recommended Buyers</h3>

          <div className="crop-list">

            {matches.map((buyer) => (
              <div
                className="crop-list-item"
                key={buyer.buyer_id}
              >

                {/* ICON */}
                <div className="crop-image">
                  <Handshake size={24} color="#2d6a4f" />
                </div>

                {/* BUYER DETAILS */}
                <div className="crop-info">

                  <h3>
                    {buyer.business_name}
                  </h3>

                  <p>
                    {buyer.buyer_type} • {buyer.district}
                  </p>

                  <p>
                    Max quantity: {buyer.max_quantity_kg} kg
                  </p>

                  <p>
                    Max price: ₹{buyer.max_price_per_kg}/kg
                  </p>

                </div>

                {/* MATCH SCORE */}
                <div className="crop-price">

                  <span>
                    Match Score
                  </span>

                  <strong>
                    {buyer.match_score}/100
                  </strong>

                </div>

                {/* VERIFIED STATUS */}
                <span className="available">
                  {buyer.verified
                    ? "VERIFIED"
                    : "UNVERIFIED"}
                </span>

                {/* SELECT BUTTON */}
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => selectBuyer(buyer)}
                >
                  Select Buyer
                </button>

              </div>
            ))}

          </div>
        </div>
      )}

      {/* SEND OFFER FORM */}
      {selectedBuyer && (
        <div
          className="page-card"
          style={{
            marginTop: "24px",
            border: "2px solid #287a49",
          }}
        >

          <div className="page-header">

            <div>
              <h2>
                <Send size={20} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />Send Offer
              </h2>

              <p>
                Sending offer to{" "}
                <strong>
                  {selectedBuyer.business_name}
                </strong>
              </p>
            </div>

          </div>

          <form
            className="crop-form"
            onSubmit={sendOffer}
          >

            <div className="form-grid">

              {/* OFFER PRICE */}
              <div>

                <label>
                  Offer Price (₹/kg)
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={offerPrice}
                  onChange={(event) =>
                    setOfferPrice(event.target.value)
                  }
                  placeholder="Enter price"
                  required
                />

              </div>

              {/* QUANTITY */}
              <div>

                <label>
                  Quantity (kg)
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={offerQuantity}
                  onChange={(event) =>
                    setOfferQuantity(event.target.value)
                  }
                  placeholder="Enter quantity"
                  required
                />

              </div>

            </div>

            {/* TOTAL */}
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

              <span>
                Total Offer Value
              </span>

              <strong
                style={{
                  fontSize: "20px",
                  color: "#287a49",
                }}
              >
                ₹
                {(
                  Number(offerPrice || 0) *
                  Number(offerQuantity || 0)
                ).toLocaleString("en-IN")}
              </strong>

            </div>

            {/* BUTTONS */}
            <div className="form-buttons">

              <button
                type="submit"
                className="primary-button"
                disabled={offerLoading}
              >
                {offerLoading
                  ? "Sending..."
                  : "Send Offer"}
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