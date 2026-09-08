import { useState } from "react";

function PricePrediction() {
  const [currentPrice, setCurrentPrice] = useState("");
  const [days, setDays] = useState(7);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  const getPrediction = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/prediction/price?current_price=${currentPrice}&days=${days}`
      );

      const data = await response.json();

      setPredictions(data);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Could not connect to prediction API.");
    }

    setLoading(false);
  };

  return (
    <div className="page-card">

      <div className="page-header">
        <div>
          <h2>Price Prediction 🤖</h2>
          <p>
            Estimate future crop prices using AgriLink's
            prediction system.
          </p>
        </div>
      </div>

      <form
        className="crop-form"
        onSubmit={getPrediction}
      >

        <div className="form-grid">

          <div>
            <label>Current Price (₹/kg)</label>

            <input
              type="number"
              step="0.01"
              value={currentPrice}
              onChange={(event) =>
                setCurrentPrice(event.target.value)
              }
              placeholder="e.g. 32"
              required
            />
          </div>

          <div>
            <label>Prediction Days</label>

            <input
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={(event) =>
                setDays(event.target.value)
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
              ? "Predicting..."
              : "Predict Price"}
          </button>

        </div>

      </form>

      {predictions.length > 0 && (
        <div className="prediction-results">

          <h3>Predicted Prices</h3>

          <div className="prediction-grid">

            {predictions.map((prediction) => (
              <div
                className="prediction-card"
                key={prediction.date}
              >
                <span>{prediction.date}</span>

                <strong>
                  ₹{prediction.predicted_price}/kg
                </strong>
              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}

export default PricePrediction;