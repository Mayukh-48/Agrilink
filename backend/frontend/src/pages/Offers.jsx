import { useEffect, useState } from "react";
import { Briefcase, Handshake, CheckCircle, XCircle } from "lucide-react";
import { API_BASE } from "../config";

function Offers({ onOffersChange }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem("role");
  const buyerId = localStorage.getItem("buyer_id");
  const farmerId = localStorage.getItem("farmer_id");

  const isBuyer = role === "BUYER";

  const fetchOffers = async () => {
    try {
      let url = `${API_BASE}/api/offers`;

      // Buyers receive offers sent by farmers
      if (isBuyer && buyerId) {
        url += `?buyer_id=${buyerId}`;
      }

      // Farmers receive offers sent by buyers
      if (!isBuyer && farmerId) {
        url += `?farmer_id=${farmerId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || data.error) {
        alert(data.error || "Could not load offers.");
        return;
      }

      setOffers(Array.isArray(data) ? data : []);
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

      if (!response.ok || data.error) {
        alert(data.error || "Could not update offer.");
        return;
      }

      alert(
        `Offer #${offerId} ${action === "accept" ? "accepted" : "rejected"
        } successfully.`
      );

      await fetchOffers();

      if (onOffersChange) {
        onOffersChange();
      }
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
          <h2
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Briefcase size={22} color="#1b4332" />

            {isBuyer ? "Incoming Offers" : "My Offers"}
          </h2>

          <p>
            {isBuyer
              ? "View offers received from farmers and respond to them."
              : "View and manage offers sent to buyers."}
          </p>
        </div>
      </div>

      {/* OFFERS */}
      {offers.length === 0 ? (
        <p>
          {isBuyer
            ? "No incoming offers found."
            : "No offers found."}
        </p>
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
                  <strong>Crop:</strong>{" "}
                  {offer.crop_commodity ||
                    `Crop Lot #${offer.crop_lot_id}`}
                </p>

                {isBuyer ? (
                  <p>
                    <strong>Farmer:</strong>{" "}
                    {offer.farmer_name ||
                      `Farmer #${offer.farmer_id}`}
                  </p>
                ) : (
                  <p>
                    <strong>Buyer:</strong>{" "}
                    {offer.buyer_name ||
                      `Buyer #${offer.buyer_id}`}
                  </p>
                )}

                <p>
                  <strong>Quantity:</strong>{" "}
                  {Number(offer.quantity_kg).toLocaleString("en-IN")} kg
                </p>

                <p>
                  <strong>Total Value:</strong> ₹
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

              {/* RECIPIENT ACTIONS */}
              {offer.status === "PENDING" &&
                (
                  (isBuyer && offer.sender_role === "FARMER") ||
                  (!isBuyer && offer.sender_role === "BUYER")
                ) && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexDirection: "column",
                    }}
                  >
                    <button
                      className="primary-button"
                      disabled={loading}
                      onClick={() =>
                        updateOfferStatus(offer.id, "accept")
                      }
                    >
                      <CheckCircle size={16} />
                      Accept
                    </button>

                    <button
                      className="secondary-button"
                      disabled={loading}
                      onClick={() =>
                        updateOfferStatus(offer.id, "reject")
                      }
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                )}

              {/* WAITING MESSAGE FOR OFFER SENDER */}
              {offer.status === "PENDING" &&
                (
                  (isBuyer && offer.sender_role === "BUYER") ||
                  (!isBuyer && offer.sender_role === "FARMER")
                ) && (
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      fontStyle: "italic",
                    }}
                  >
                    Waiting for {isBuyer ? "farmer" : "buyer"} response...
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