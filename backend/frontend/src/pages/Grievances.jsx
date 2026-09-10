import { useEffect, useState } from "react";
import { MessageSquare, FileText } from "lucide-react";
import { API_BASE } from "../config";

function Grievances() {
  const [grievances, setGrievances] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    farmer_id: "1",
    category: "PAYMENT",
    description: "",
    offer_id: "",
  });

  // Fetch grievances
  const fetchGrievances = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/grievances`
      );

      const data = await response.json();

      setGrievances(data);
    } catch (error) {
      console.error("Grievances error:", error);
      alert("Could not load grievances.");
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // Submit grievance
  const submitGrievance = async (event) => {
    event.preventDefault();

    if (!form.description.trim()) {
      alert("Please describe your grievance.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        farmer_id: form.farmer_id,
        category: form.category,
        description: form.description,
      });

      if (form.offer_id) {
        params.append("offer_id", form.offer_id);
      }

      const response = await fetch(
        `${API_BASE}/api/grievances?${params.toString()}`,
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
        `Grievance #${data.id} submitted successfully.`
      );

      // Reset form
      setForm({
        farmer_id: "1",
        category: "PAYMENT",
        description: "",
        offer_id: "",
      });

      setShowForm(false);

      await fetchGrievances();
    } catch (error) {
      console.error("Submit grievance error:", error);
      alert("Could not submit grievance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={22} color="#1b4332" /> Grievances</h2>
          <p>
            Submit and track your complaints and issues.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm
            ? "Close"
            : "+ Submit Grievance"}
        </button>
      </div>

      {/* GRIEVANCE FORM */}
      {showForm && (
        <div
          className="page-card"
          style={{
            marginTop: "20px",
            border: "2px solid #287a49",
          }}
        >
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={20} color="#1b4332" /> Submit New Grievance</h2>

          <form
            className="crop-form"
            onSubmit={submitGrievance}
          >
            <div className="form-grid">

              {/* CATEGORY */}
              <div>
                <label>Category</label>

                <select
                  name="category"
                  value={form.category}
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
                  <option value="PAYMENT">
                    Payment Issue
                  </option>

                  <option value="QUALITY">
                    Crop Quality
                  </option>

                  <option value="BUYER">
                    Buyer Issue
                  </option>

                  <option value="LOGISTICS">
                    Logistics Issue
                  </option>

                  <option value="PRICE">
                    Price Issue
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

              {/* OFFER ID */}
              <div>
                <label>
                  Offer ID (Optional)
                </label>

                <input
                  type="number"
                  min="1"
                  name="offer_id"
                  value={form.offer_id}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                />
              </div>

            </div>

            {/* DESCRIPTION */}
            <div style={{ marginTop: "18px" }}>
              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your issue..."
                rows="5"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  backgroundColor: "white",
                  color: "#1f2937",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* BUTTONS */}
            <div className="form-buttons">

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Submitting..."
                  : "Submit Grievance"}
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
        </div>
      )}

      {/* GRIEVANCE LIST */}
      <div style={{ marginTop: "24px" }}>

        <h3>Your Grievances</h3>

        {grievances.length === 0 ? (
          <p>No grievances found.</p>
        ) : (
          <div className="crop-list">

            {grievances.map((grievance) => (
              <div
                className="crop-list-item"
                key={grievance.id}
              >

                {/* ICON */}
                <div className="crop-image">
                  <MessageSquare size={24} color="#2d6a4f" />
                </div>

                {/* DETAILS */}
                <div className="crop-info">

                  <h3>
                    Grievance #{grievance.id}
                  </h3>

                  <p>
                    Category:{" "}
                    {grievance.category}
                  </p>

                  <p>
                    {grievance.description}
                  </p>

                  {grievance.offer_id && (
                    <p>
                      Related Offer: #
                      {grievance.offer_id}
                    </p>
                  )}

                  {grievance.resolution && (
                    <p>
                      Resolution:{" "}
                      {grievance.resolution}
                    </p>
                  )}

                </div>

                {/* STATUS */}
                <span className="available">
                  {grievance.status}
                </span>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Grievances;