WEATHER_CODES = {
    0: ("Clear", "01d", "clear sky"),
    1: ("Clouds", "02d", "mainly clear"),
    2: ("Clouds", "03d", "partly cloudy"),
    3: ("Clouds", "04d", "overcast"),
    45: ("Mist", "50d", "fog"),
    48: ("Mist", "50d", "depositing rime fog"),
    51: ("Drizzle", "09d", "light drizzle"),
    53: ("Drizzle", "09d", "moderate drizzle"),
    55: ("Drizzle", "09d", "dense drizzle"),
    61: ("Rain", "10d", "slight rain"),
    63: ("Rain", "10d", "moderate rain"),
    65: ("Rain", "10d", "heavy rain"),
    71: ("Snow", "13d", "slight snow"),
    73: ("Snow", "13d", "moderate snow"),
    75: ("Snow", "13d", "heavy snow"),
    80: ("Rain", "09d", "rain showers"),
    81: ("Rain", "09d", "moderate rain showers"),
    82: ("Rain", "09d", "violent rain showers"),
    95: ("Thunderstorm", "11d", "thunderstorm"),
}


def describe_weather_code(code: int | None) -> tuple[str, str, str]:
    return WEATHER_CODES.get(int(code or 0), ("Clouds", "03d", "variable weather"))


def uv_label(value: float) -> str:
    if value < 3:
        return "Low"
    if value < 6:
        return "Moderate"
    if value < 8:
        return "High"
    if value < 11:
        return "Very High"
    return "Extreme"


def aqi_label(value: int) -> str:
    return {1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor"}.get(value, "Unknown")

