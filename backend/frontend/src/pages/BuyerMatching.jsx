import { useState } from "react";

function BuyerMatching() {
  const [cropLotId, setCropLotId] = useState(1);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const findBuyers = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/buyers/match/${cropLotId}`
      );

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        setMatches([]);
        return;
      }

      setMatches(data.matches || []);
    } catch (error) {
      console.error("Buyer matching error:", error);
      alert("Could not connect to buyer matching API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">

      <div className="page-header">
        <div>
          <h2>Buyer Matching 🤝</h2>
          <p>
            Find buyers that best match your crop.
          </p>
        </div>
      </div>

      <form
        className="crop-form"
        onSubmit={findBuyers}
      >

        <div className="form-grid">

          <div>
            <label>Crop Lot ID</label>

            <input
              type="number"
              min="1"
              value={cropLotId}
              onChange={(event) =>
                setCropLotId(event.target.value)
              }
              required
            />
          </div>

        </div>

        <div className="form-buttons">

          <button
            type="submit"
            className="primary-button"
          >
            {loading
              ? "Finding Buyers..."
              : "Find Best Buyers"}
          </button>

        </div>

      </form>

      {matches.length > 0 && (
        <div className="prediction-results">

          <h3>Recommended Buyers</h3>

          <div className="crop-list">

            {matches.map((buyer) => (
              <div
                className="crop-list-item"
                key={buyer.buyer_id}
              >

                <div className="crop-image">
                  🤝
                </div>

                <div className="crop-info">

                  <h3>
                    {buyer.business_name}
                  </h3>

                  <p>
                    {buyer.buyer_type} •{" "}
                    {buyer.district}
                  </p>

                  <p>
                    Max quantity:{" "}
                    {buyer.max_quantity_kg} kg
                  </p>

                  <p>
                    Max price: ₹
                    {buyer.max_price_per_kg}/kg
                  </p>

                </div>

                <div className="crop-price">

                  <span>Match Score</span>

                  <strong>
                    {buyer.match_score}/100
                  </strong>

                </div>

                <span className="available">
                  {buyer.verified
                    ? "VERIFIED"
                    : "UNVERIFIED"}
                </span>

              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}

export default BuyerMatching;