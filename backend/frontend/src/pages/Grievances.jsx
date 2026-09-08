import { useEffect, useState } from "react";

function Grievances() {
  const [grievances, setGrievances] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/grievances")
      .then((response) => response.json())
      .then((data) => {
        setGrievances(data);
      })
      .catch((error) => {
        console.error("Grievances error:", error);
      });
  }, []);

  return (
    <div className="page-card">

      <div className="page-header">
        <div>
          <h2>Grievances 📝</h2>
          <p>
            Submit and track your grievances.
          </p>
        </div>
      </div>

      {grievances.length === 0 ? (
        <p>No grievances found.</p>
      ) : (
        <div className="crop-list">

          {grievances.map((grievance) => (
            <div
              className="crop-list-item"
              key={grievance.id}
            >

              <div className="crop-image">
                📝
              </div>

              <div className="crop-info">

                <h3>
                  Grievance #{grievance.id}
                </h3>

                <p>
                  Category: {grievance.category}
                </p>

                <p>
                  {grievance.description}
                </p>

                {grievance.resolution && (
                  <p>
                    Resolution:{" "}
                    {grievance.resolution}
                  </p>
                )}

              </div>

              <span className="available">
                {grievance.status}
              </span>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Grievances;