import { useEffect, useState } from "react";
import { Truck, Package } from "lucide-react";
import { API_BASE } from "../config";

function Logistics() {
  const [logistics, setLogistics] = useState([]);
  const [offers, setOffers] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    offer_id: "",
    pickup_location: "",
    delivery_location: "",
    transporter_name: "",
    vehicle_number: "",
  });

  // Fetch logistics records
  const fetchLogistics = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/logistics`
      );

      const data = await response.json();
      setLogistics(data);
    } catch (error) {
      console.error("Logistics error:", error);
      alert("Could not load logistics records.");
    }
  };

  // Fetch offers
  const fetchOffers = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/offers`
      );

      const data = await response.json();

      // Only accepted offers can be shipped
      const acceptedOffers = data.filter(
        (offer) => offer.status === "ACCEPTED"
      );

      setOffers(acceptedOffers);
    } catch (error) {
      console.error("Offers error:", error);
    }
  };

  useEffect(() => {
    fetchLogistics();
    fetchOffers();
  }, []);

  // Handle form input
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // Create shipment
  const createShipment = async (event) => {
    event.preventDefault();

    if (!form.offer_id) {
      alert("Please select an accepted offer.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        offer_id: form.offer_id,
        pickup_location: form.pickup_location,
        delivery_location: form.delivery_location,
        transporter_name: form.transporter_name,
        vehicle_number: form.vehicle_number,
      });

      const response = await fetch(
        `${API_BASE}/api/logistics?${params.toString()}`,
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
        `Shipment #${data.id} created successfully!`
      );

      // Reset form
      setForm({
        offer_id: "",
        pickup_location: "",
        delivery_location: "",
        transporter_name: "",
        vehicle_number: "",
      });

      setShowForm(false);

      // Refresh logistics
      await fetchLogistics();
    } catch (error) {
      console.error("Create shipment error:", error);
      alert("Could not create shipment.");
    } finally {
      setLoading(false);
    }
  };

  // Update shipment status
  const updateStatus = async (logisticsId, status) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/logistics/${logisticsId}/status?status=${status}`,
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
        `Shipment #${logisticsId} updated to ${status}.`
      );

      await fetchLogistics();
    } catch (error) {
      console.error("Status update error:", error);
      alert("Could not update shipment status.");
    }
  };

  return (
    <div className="page-card">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={22} color="#1b4332" /> Logistics</h2>
          <p>
            Create and track crop pickup and delivery.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm
            ? "Close"
            : "+ Create Shipment"}
        </button>
      </div>

      {/* CREATE SHIPMENT FORM */}
      {showForm && (
        <div
          className="page-card"
          style={{
            marginTop: "20px",
            border: "2px solid #287a49",
          }}
        >

          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={20} color="#1b4332" /> Create New Shipment</h2>

          {offers.length === 0 ? (
            <p>
              No accepted offers available.
              Accept an offer first to create a shipment.
            </p>
          ) : (
            <form
              className="crop-form"
              onSubmit={createShipment}
            >

              <div className="form-grid">

                {/* OFFER */}
                <div>
                  <label>Accepted Offer</label>

                  <select
                    name="offer_id"
                    value={form.offer_id}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      backgroundColor: "white",
                      color: "#1f2937",
                    }}
                  >
                    <option value="">
                      Select Offer
                    </option>

                    {offers.map((offer) => (
                      <option
                        key={offer.id}
                        value={offer.id}
                      >
                        Offer #{offer.id} — ₹
                        {offer.offered_price_per_kg}/kg —{" "}
                        {offer.quantity_kg} kg
                      </option>
                    ))}
                  </select>
                </div>

                {/* PICKUP */}
                <div>
                  <label>Pickup Location</label>

                  <input
                    type="text"
                    name="pickup_location"
                    value={form.pickup_location}
                    onChange={handleChange}
                    placeholder="e.g. Nashik"
                    required
                  />
                </div>

                {/* DELIVERY */}
                <div>
                  <label>Delivery Location</label>

                  <input
                    type="text"
                    name="delivery_location"
                    value={form.delivery_location}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai"
                    required
                  />
                </div>

                {/* TRANSPORTER */}
                <div>
                  <label>Transporter Name</label>

                  <input
                    type="text"
                    name="transporter_name"
                    value={form.transporter_name}
                    onChange={handleChange}
                    placeholder="e.g. ABC Logistics"
                  />
                </div>

                {/* VEHICLE */}
                <div>
                  <label>Vehicle Number</label>

                  <input
                    type="text"
                    name="vehicle_number"
                    value={form.vehicle_number}
                    onChange={handleChange}
                    placeholder="e.g. MH12AB1234"
                  />
                </div>

              </div>

              <div className="form-buttons">

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  {loading
                    ? "Creating..."
                    : "Create Shipment"}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

              </div>

            </form>
          )}
        </div>
      )}

      {/* EXISTING SHIPMENTS */}
      <div style={{ marginTop: "24px" }}>

        <h3>Shipments</h3>

        {logistics.length === 0 ? (
          <p>No logistics records found.</p>
        ) : (
          <div className="crop-list">

            {logistics.map((item) => (
              <div
                className="crop-list-item"
                key={item.id}
              >

                {/* ICON */}
                <div className="crop-image">
                  <Truck size={24} color="#2d6a4f" />
                </div>

                {/* DETAILS */}
                <div className="crop-info">

                  <h3>
                    Shipment #{item.id}
                  </h3>

                  <p>
                    Offer: #{item.offer_id}
                  </p>

                  <p>
                    Pickup: {item.pickup_location}
                  </p>

                  <p>
                    Delivery: {item.delivery_location}
                  </p>

                  <p>
                    Transporter:{" "}
                    {item.transporter_name ||
                      "Not assigned"}
                  </p>

                  <p>
                    Vehicle:{" "}
                    {item.vehicle_number ||
                      "Not assigned"}
                  </p>

                </div>

                {/* STATUS */}
                <span className="available">
                  {item.status}
                </span>

                {/* STATUS BUTTONS */}
                {item.status !== "DELIVERED" && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexDirection: "column",
                    }}
                  >

                    {item.status === "PENDING" && (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          updateStatus(
                            item.id,
                            "PICKUP"
                          )
                        }
                      >
                        Pickup
                      </button>
                    )}

                    {item.status === "PICKUP" && (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          updateStatus(
                            item.id,
                            "IN_TRANSIT"
                          )
                        }
                      >
                        Start Transit
                      </button>
                    )}

                    {item.status === "IN_TRANSIT" && (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          updateStatus(
                            item.id,
                            "DELIVERED"
                          )
                        }
                      >
                        Delivered
                      </button>
                    )}

                  </div>
                )}

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Logistics;