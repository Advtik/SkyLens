from app.ml.advisory_predict import predict_advisory
from app.schemas.advisory import AdvisoryResponse
from app.services.groq_service import narrate_advisory


async def get_advisory(city: str, lat: float, lon: float, forecast_data: dict) -> AdvisoryResponse:
    ml_result = predict_advisory(forecast_data)
    summary = await narrate_advisory({"city": city, "days": ml_result["days"], "overall_risk": ml_result["overall_risk"]})
    return AdvisoryResponse(
        city=city,
        lat=lat,
        lon=lon,
        days=ml_result["days"],
        overall_risk=ml_result["overall_risk"],
        ml_confidence=ml_result["confidence"],
        groq_summary=summary,
    )

