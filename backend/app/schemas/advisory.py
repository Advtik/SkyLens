from pydantic import BaseModel


class DayRiskScores(BaseModel):
    attendance_disrupted: float
    commute_difficult: float
    outdoor_unsafe: float
    heat_stress: float
    rain_disruption: float
    weather_severe: float


class DayRiskFlags(BaseModel):
    attendance_disrupted: bool
    commute_difficult: bool
    outdoor_unsafe: bool
    heat_stress: bool
    rain_disruption: bool
    weather_severe: bool


class AdvisoryDay(BaseModel):
    date: str
    risk_scores: DayRiskScores
    overall_risk: str
    risk_flags: DayRiskFlags


class AdvisoryResponse(BaseModel):
    city: str
    lat: float
    lon: float
    days: list[AdvisoryDay]
    overall_risk: str
    ml_confidence: float
    groq_summary: str


class VoiceQueryRequest(BaseModel):
    query: str
    city: str
    include_advisory: bool = False
    include_disaster: bool = False


class VoiceQueryResponse(BaseModel):
    response: str
    city: str

