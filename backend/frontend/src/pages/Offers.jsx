import { useEffect, useState } from "react";
import { Briefcase, Handshake } from "lucide-react";
import { API_BASE } from "../config";

function Offers({ onOffersChange }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOffers = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/offers`
      );

      const data = await response.json();

      setOffers(data);
    } catch (error) {
      console.error("Offers error:", error);
      alert("Could not load offers.");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const updateOfferStatus = async (offerId, action) => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/offers/${offerId}/${action}`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      alert(
        `Offer #${offerId} ${
          action === "accept" ? "accepted" : "rejected"
        } successfully.`
      );

      await fetchOffers();
      if (onOffersChange) onOffersChange();
    } catch (error) {
      console.error("Offer status error:", error);
      alert("Could not update offer status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={22} color="#1b4332" /> Offers</h2>
          <p>
            View and manage offers received from buyers.
          </p>
        </div>
      </div>

      {/* OFFERS */}
      {offers.length === 0 ? (
        <p>No offers found.</p>
      ) : (
        <div className="crop-list">

          {offers.map((offer) => (
            <div
              className="crop-list-item"
              key={offer.id}
            >

              {/* ICON */}
              <div className="crop-image">
                <Handshake size={24} color="#2d6a4f" />
              </div>

              {/* OFFER DETAILS */}
              <div className="crop-info">

                <h3>
                  Offer #{offer.id}
                </h3>

                <p>
                  <strong>Crop:</strong> {offer.crop_commodity || `Crop Lot #${offer.crop_lot_id}`}
                </p>

                <p>
                  <strong>Buyer:</strong> {offer.buyer_name || `Buyer #${offer.buyer_id}`}
                </p>

                <p>
                  Quantity: {offer.quantity_kg} kg
                </p>

                <p>
                  Total Value: ₹
                  {Number(
                    offer.total_amount || 0
                  ).toLocaleString("en-IN")}
                </p>

              </div>

              {/* PRICE */}
              <div className="crop-price">

                <span>
                  Offered Price
                </span>

                <strong>
                  ₹{offer.offered_price_per_kg}/kg
                </strong>

              </div>

              {/* STATUS */}
              <span className="available">
                {offer.status}
              </span>

              {/* ACTIONS */}
              {offer.status === "PENDING" && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexDirection: "column",
                  }}
                >

                  <button
                    type="button"
                    className="primary-button"
                    disabled={loading}
                    onClick={() =>
                      updateOfferStatus(
                        offer.id,
                        "accept"
                      )
                    }
                  >
                    Accept
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    disabled={loading}
                    onClick={() =>
                      updateOfferStatus(
                        offer.id,
                        "reject"
                      )
                    }
                  >
                    Reject
                  </button>

                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Offers;