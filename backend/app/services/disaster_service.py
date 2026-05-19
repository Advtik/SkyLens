from app.ml.disaster_predict import detect_anomaly, predict_disaster
from app.schemas.disaster import DisasterResponse
from app.services.groq_service import narrate_disaster


async def get_disaster_assessment(city: str, lat: float, lon: float, historical_df, forecast_data: dict) -> DisasterResponse:
    ml_result = predict_disaster(forecast_data)
    anomaly_score = detect_anomaly(historical_df)
    explanation = await narrate_disaster({"city": city, "alerts": ml_result["alerts"], "anomaly_score": anomaly_score})
    return DisasterResponse(
        city=city,
        lat=lat,
        lon=lon,
        alerts=ml_result["alerts"],
        anomaly_score=anomaly_score,
        ml_confidence=ml_result["confidence"],
        groq_explanation=explanation,
    )

