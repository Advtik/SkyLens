from pydantic import BaseModel


class ProbaBreakdown(BaseModel):
    none: float
    flood: float
    storm: float
    heatwave: float


class DisasterAlert(BaseModel):
    date: str
    type: str
    confidence: float
    risk_level: str
    proba_breakdown: ProbaBreakdown
    triggered_features: list[str]


class DisasterResponse(BaseModel):
    city: str
    lat: float
    lon: float
    alerts: list[DisasterAlert]
    anomaly_score: float
    ml_confidence: float
    groq_explanation: str

