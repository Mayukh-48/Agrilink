from datetime import date, timedelta


def predict_price(current_price: float, days: int = 7):
    """
    Demo price prediction.

    This is a temporary prediction function.
    Later we will replace it with a trained ML model.
    """

    predictions = []

    for day in range(1, days + 1):

        prediction_date = date.today() + timedelta(days=day)

        # Small demo price increase
        predicted_price = current_price * (
            1 + (0.01 * day)
        )

        predictions.append({
            "date": str(prediction_date),
            "predicted_price": round(predicted_price, 2)
        })

    return predictions