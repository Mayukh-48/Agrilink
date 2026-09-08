import { useEffect, useState } from "react";

function Offers() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/offers")
      .then((response) => response.json())
      .then((data) => {
        setOffers(data);
      })
      .catch((error) => {
        console.error("Offers error:", error);
      });
  }, []);

  return (
    <div className="page-card">

      <div className="page-header">
        <div>
          <h2>Offers 💰</h2>
          <p>
            View offers received from buyers.
          </p>
        </div>
      </div>

      {offers.length === 0 ? (
        <p>No offers found.</p>
      ) : (
        <div className="crop-list">

          {offers.map((offer) => (
            <div
              className="crop-list-item"
              key={offer.id}
            >

              <div className="crop-image">
                💰
              </div>

              <div className="crop-info">

                <h3>
                  Offer #{offer.id}
                </h3>

                <p>
                  Crop Lot: #{offer.crop_lot_id}
                </p>

                <p>
                  Buyer: #{offer.buyer_id}
                </p>

                <p>
                  Quantity: {offer.quantity_kg} kg
                </p>

              </div>

              <div className="crop-price">

                <span>Offered Price</span>

                <strong>
                  ₹{offer.offered_price_per_kg}/kg
                </strong>

              </div>

              <span className="available">
                {offer.status}
              </span>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Offers;