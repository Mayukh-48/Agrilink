import { useEffect, useState } from "react";
import {
  Briefcase,
  Handshake,
  CheckCircle,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
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

      if (isBuyer && buyerId) {
        url += `?buyer_id=${buyerId}`;
      }

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

  // --------------------------------------------------
  // SEPARATE INCOMING AND OUTGOING OFFERS
  // --------------------------------------------------

  const incomingOffers = offers.filter((offer) =>
    isBuyer
      ? offer.sender_role === "FARMER"
      : offer.sender_role === "BUYER"
  );

  const outgoingOffers = offers.filter((offer) =>
    isBuyer
      ? offer.sender_role === "BUYER"
      : offer.sender_role === "FARMER"
  );

  // --------------------------------------------------
  // OFFER CARD
  // --------------------------------------------------

  const renderOffer = (offer, isIncoming) => (
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

      {/* INCOMING OFFER ACTIONS */}
      {isIncoming &&
        offer.status === "PENDING" && (
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
                updateOfferStatus(
                  offer.id,
                  "accept"
                )
              }
            >
              <CheckCircle size={16} />
              Accept
            </button>

            <button
              className="secondary-button"
              disabled={loading}
              onClick={() =>
                updateOfferStatus(
                  offer.id,
                  "reject"
                )
              }
            >
              <XCircle size={16} />
              Reject
            </button>
          </div>
        )}

      {/* OUTGOING OFFER WAITING MESSAGE */}
      {!isIncoming &&
        offer.status === "PENDING" && (
          <div
            style={{
              fontSize: "14px",
              color: "#6b7280",
              fontStyle: "italic",
            }}
          >
            Waiting for{" "}
            {isBuyer ? "farmer" : "buyer"} response...
          </div>
        )}
    </div>
  );

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
            <Briefcase
              size={22}
              color="#1b4332"
            />

            Offers
          </h2>

          <p>
            View incoming offers and track offers you have sent.
          </p>
        </div>
      </div>

      {/* ============================= */}
      {/* INCOMING OFFERS */}
      {/* ============================= */}

      <div style={{ marginBottom: "32px" }}>
        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#1b4332",
            marginBottom: "8px",
          }}
        >
          <ArrowDownLeft size={20} />
          Incoming Offers
        </h3>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "16px",
          }}
        >
          {isBuyer
            ? "Offers received from farmers."
            : "Offers received from buyers."}
        </p>

        {incomingOffers.length === 0 ? (
          <div
            style={{
              padding: "20px",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              color: "#6b7280",
            }}
          >
            No incoming offers found.
          </div>
        ) : (
          <div className="crop-list">
            {incomingOffers.map((offer) =>
              renderOffer(offer, true)
            )}
          </div>
        )}
      </div>

      {/* ============================= */}
      {/* OUTGOING OFFERS */}
      {/* ============================= */}

      <div>
        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#1b4332",
            marginBottom: "8px",
          }}
        >
          <ArrowUpRight size={20} />
          Outgoing Offers
        </h3>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "16px",
          }}
        >
          {isBuyer
            ? "Offers you have sent to farmers."
            : "Offers you have sent to buyers."}
        </p>

        {outgoingOffers.length === 0 ? (
          <div
            style={{
              padding: "20px",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              color: "#6b7280",
            }}
          >
            No outgoing offers found.
          </div>
        ) : (
          <div className="crop-list">
            {outgoingOffers.map((offer) =>
              renderOffer(offer, false)
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default Offers;