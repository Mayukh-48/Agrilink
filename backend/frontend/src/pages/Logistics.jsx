import { useEffect, useState } from "react";

function Logistics() {
  const [logistics, setLogistics] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/logistics")
      .then((response) => response.json())
      .then((data) => {
        setLogistics(data);
      })
      .catch((error) => {
        console.error("Logistics error:", error);
      });
  }, []);

  return (
    <div className="page-card">

      <div className="page-header">
        <div>
          <h2>Logistics 🚚</h2>
          <p>
            Track crop pickup and delivery.
          </p>
        </div>
      </div>

      {logistics.length === 0 ? (
        <p>No logistics records found.</p>
      ) : (
        <div className="crop-list">

          {logistics.map((item) => (
            <div
              className="crop-list-item"
              key={item.id}
            >

              <div className="crop-image">
                🚚
              </div>

              <div className="crop-info">

                <h3>
                  Shipment #{item.id}
                </h3>

                <p>
                  Pickup: {item.pickup_location}
                </p>

                <p>
                  Delivery: {item.delivery_location}
                </p>

                <p>
                  Transporter:{" "}
                  {item.transporter_name || "Not assigned"}
                </p>

                <p>
                  Vehicle:{" "}
                  {item.vehicle_number || "Not assigned"}
                </p>

              </div>

              <span className="available">
                {item.status}
              </span>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Logistics;