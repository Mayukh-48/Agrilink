import { useEffect, useState } from "react";

function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/payments")
      .then((response) => response.json())
      .then((data) => {
        setPayments(data);
      })
      .catch((error) => {
        console.error("Payments error:", error);
      });
  }, []);

  return (
    <div className="page-card">

      <div className="page-header">
        <div>
          <h2>Payments 💳</h2>
          <p>
            View your agricultural transactions.
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <p>No payment records found.</p>
      ) : (
        <div className="crop-list">

          {payments.map((payment) => (
            <div
              className="crop-list-item"
              key={payment.id}
            >

              <div className="crop-image">
                💳
              </div>

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

              <div className="crop-price">

                <span>Amount</span>

                <strong>
                  ₹{payment.amount.toLocaleString("en-IN")}
                </strong>

              </div>

              <span className="available">
                {payment.status}
              </span>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Payments;