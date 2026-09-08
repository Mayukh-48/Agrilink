import { useState } from "react";

function BuyerMatching() {
  const [cropLotId, setCropLotId] = useState(1);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQuantity, setOfferQuantity] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);

  // Find matching buyers
  const findBuyers = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMatches([]);
    setSelectedBuyer(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/buyers/match/${cropLotId}`
      );

      const data = await response.json();

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
        `http://127.0.0.1:8000/api/offers?${params.toString()}`,
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
          <h2>Buyer Matching 🤝</h2>
          <p>Find buyers that best match your crop.</p>
        </div>
      </div>

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
                  🤝
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
                Send Offer 💰
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