import { useEffect, useState } from "react";
import { CreditCard, Banknote } from "lucide-react";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [offers, setOffers] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    offer_id: "",
    payment_method: "UPI",
    transaction_reference: "",
  });

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/payments"
      );

      const data = await response.json();

      setPayments(data);
    } catch (error) {
      console.error("Payments error:", error);
      alert("Could not load payment records.");
    }
  };

  // Fetch accepted offers
  const fetchOffers = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/offers"
      );

      const data = await response.json();

      const acceptedOffers = data.filter(
        (offer) => offer.status === "ACCEPTED"
      );

      // Remove offers that already have payments
      const unpaidOffers = acceptedOffers.filter(
        (offer) =>
          !payments.some(
            (payment) => payment.offer_id === offer.id
          )
      );

      setOffers(unpaidOffers);
    } catch (error) {
      console.error("Offers error:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (payments) {
      fetchOffers();
    }
  }, [payments]);

  // Handle form changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // Create payment
  const createPayment = async (event) => {
    event.preventDefault();

    if (!form.offer_id) {
      alert("Please select an accepted offer.");
      return;
    }

    if (!form.transaction_reference) {
      alert("Please enter a transaction reference.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        offer_id: form.offer_id,
        payment_method: form.payment_method,
        transaction_reference: form.transaction_reference,
      });

      const response = await fetch(
        `http://127.0.0.1:8000/api/payments?${params.toString()}`,
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
        `Payment successful!\nTransaction #${data.id}\nAmount: ₹${Number(
          data.amount || 0
        ).toLocaleString("en-IN")}`
      );

      setForm({
        offer_id: "",
        payment_method: "UPI",
        transaction_reference: "",
      });

      setShowForm(false);

      await fetchPayments();
    } catch (error) {
      console.error("Payment creation error:", error);
      alert("Could not create payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard size={22} color="#1b4332" /> Payments</h2>
          <p>
            Make payments for accepted agricultural offers.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm
            ? "Close"
            : "+ Make Payment"}
        </button>
      </div>

      {/* PAYMENT FORM */}
      {showForm && (
        <div
          className="page-card"
          style={{
            marginTop: "20px",
            border: "2px solid #287a49",
          }}
        >

          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Banknote size={20} color="#1b4332" /> Create Payment</h2>

          {offers.length === 0 ? (
            <p>
              No unpaid accepted offers available.
              Accept an offer first before making a payment.
            </p>
          ) : (
            <form
              className="crop-form"
              onSubmit={createPayment}
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
                        {Number(
                          offer.total_amount || 0
                        ).toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PAYMENT METHOD */}
                <div>
                  <label>Payment Method</label>

                  <select
                    name="payment_method"
                    value={form.payment_method}
                    onChange={handleChange}
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
                    <option value="UPI">
                      UPI
                    </option>

                    <option value="BANK_TRANSFER">
                      Bank Transfer
                    </option>

                    <option value="CASH">
                      Cash
                    </option>
                  </select>
                </div>

                {/* TRANSACTION REFERENCE */}
                <div>
                  <label>
                    Transaction Reference
                  </label>

                  <input
                    type="text"
                    name="transaction_reference"
                    value={
                      form.transaction_reference
                    }
                    onChange={handleChange}
                    placeholder="e.g. AGRI-TXN-002"
                    required
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
                    ? "Processing..."
                    : "Confirm Payment"}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

              </div>

            </form>
          )}

        </div>
      )}

      {/* PAYMENT HISTORY */}
      <div style={{ marginTop: "24px" }}>

        <h3>Transaction History</h3>

        {payments.length === 0 ? (
          <p>No payment records found.</p>
        ) : (
          <div className="crop-list">

            {payments.map((payment) => (
              <div
                className="crop-list-item"
                key={payment.id}
              >

                {/* ICON */}
                <div className="crop-image">
                  <CreditCard size={24} color="#2d6a4f" />
                </div>

                {/* DETAILS */}
                <div className="crop-info">

                  <h3>
                    Transaction #{payment.id}
                  </h3>

                  <p>
                    Offer: #{payment.offer_id}
                  </p>

                  <p>
                    Method: {payment.payment_method}
                  </p>

                  <p>
                    Reference:{" "}
                    {payment.transaction_reference}
                  </p>

                </div>

                {/* AMOUNT */}
                <div className="crop-price">

                  <span>
                    Amount
                  </span>

                  <strong>
                    ₹
                    {Number(
                      payment.amount || 0
                    ).toLocaleString("en-IN")}
                  </strong>

                </div>

                {/* STATUS */}
                <span className="available">
                  {payment.status}
                </span>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Payments;