function MarketPrices({ marketPrices }) {
  return (
    <div className="page-card">

      <div className="page-header">
        <div>
          <h2>Market Prices</h2>
          <p>
            Current market prices across major APMCs.
          </p>
        </div>

        <span className="market-badge">
          🧅 Onion
        </span>
      </div>

      {marketPrices.length === 0 ? (
        <p>No market prices found.</p>
      ) : (
        <div className="market-table-wrapper">

          <table className="market-table">

            <thead>
              <tr>
                <th>Market</th>
                <th>District</th>
                <th>Commodity</th>
                <th>Variety</th>
                <th>Min Price</th>
                <th>Max Price</th>
                <th>Modal Price</th>
                <th>Arrival</th>
              </tr>
            </thead>

            <tbody>
              {marketPrices.map((market) => (
                <tr key={market.id}>

                  <td>
                    <strong>{market.market_name}</strong>
                  </td>

                  <td>{market.district}</td>

                  <td>{market.commodity}</td>

                  <td>
                    {market.variety || "—"}
                  </td>

                  <td>
                    ₹{market.min_price}/kg
                  </td>

                  <td>
                    ₹{market.max_price}/kg
                  </td>

                  <td className="modal-price">
                    ₹{market.modal_price}/kg
                  </td>

                  <td>
                    {market.arrival_quantity} tons
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default MarketPrices;