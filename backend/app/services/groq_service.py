import hashlib
import re
from datetime import datetime
from typing import Any

import httpx
from dateutil import parser

from app.config import settings

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def sanitize_voice_query(query: str) -> str:
    return re.sub(r"<[^>]+>", "", query or "")[:500].strip()


def extract_requested_date(query: str) -> str | None:

    try:

        parsed = parser.parse(
            query,
            fuzzy=True,
            default=datetime.now(),
        )

        return parsed.strftime("%Y-%m-%d")

    except Exception:
        return None


def extract_city(query: str) -> str | None:

    query = query.strip()

    patterns = [
        r"\bin\s+([a-zA-Z\s]+)",
        r"\bfor\s+([a-zA-Z\s]+)",
        r"\bat\s+([a-zA-Z\s]+)",
    ]

    blacklist = {
        "school",
        "college",
        "today",
        "tomorrow",
        "temperature",
        "weather",
        "forecast",
        "rain",
        "outside",
        "danger",
        "safe",
    }

    for pattern in patterns:

        match = re.search(
            pattern,
            query,
            re.IGNORECASE,
        )

        if match:

            city = (
                match.group(1)
                .strip()
                .title()
            )

            city_words = [
                word
                for word in city.split()
                if word.lower() not in blacklist
            ]

            city = " ".join(city_words)

            if city:
                return city

    return None


async def call_groq(
    system_prompt: str,
    user_message: str,
    max_tokens: int = 160,
) -> str:

    if not settings.groq_api_key:
        return ""

    payload = {
        "model": settings.groq_model,
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_message,
            },
        ],
        "temperature": 0.6,
        "max_tokens": max_tokens,
    }

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(
        timeout=settings.groq_timeout
    ) as client:

        response = await client.post(
            GROQ_URL,
            json=payload,
            headers=headers,
        )

    response.raise_for_status()

    data = response.json()

    return (
        data["choices"][0]["message"]["content"]
        .strip()
    )


async def call_groq_safe(
    system_prompt: str,
    user_message: str,
    max_tokens: int = 160,
) -> str:

    try:

        return await call_groq(
            system_prompt,
            user_message,
            max_tokens=max_tokens,
        )

    except Exception as e:

        print("\n========== GROQ ERROR ==========")
        print(type(e))
        print(str(e))
        print("================================\n")

        return ""


async def narrate_advisory(
    advisory_data: dict[str, Any]
) -> str:

    system = """
You are SkyLens Advisory Intelligence.

Generate a concise advisory in under 4 lines.

Focus on:
- school conditions
- commute comfort
- weather impact
- practical guidance

Avoid long explanations.
"""

    text = await call_groq_safe(
        system,
        f"ADVISORY DATA:\n{advisory_data}",
        max_tokens=120,
    )

    if text:
        return text

    return (
        "Weather conditions may slightly affect outdoor "
        "activities and commute comfort."
    )


async def narrate_disaster(
    disaster_data: dict[str, Any]
) -> str:

    system = """
You are SkyLens Disaster Intelligence.

Generate a short disaster/weather risk summary.

Keep it:
- concise
- practical
- under 4 lines

Avoid dramatic wording.
"""

    text = await call_groq_safe(
        system,
        f"DISASTER DATA:\n{disaster_data}",
        max_tokens=120,
    )

    if text:
        return text

    alerts = disaster_data.get("alerts", [])

    if alerts:
        return (
            "Elevated weather risks are currently active. "
            "Please monitor local advisories carefully."
        )

    return "No major severe weather alerts are currently active."


def build_voice_context(
    weather: dict | None,
    forecast: dict | None,
    advisory: dict | None,
    disaster: dict | None,
) -> dict:

    available_forecast = (
        forecast or {}
    ).get("daily", [])

    return {
        "current_weather": {
            "city": weather.get("city"),
            "temperature_c": weather.get("temp_c"),
            "condition": weather.get("condition"),
            "humidity": weather.get("humidity"),
            "wind_speed_ms": weather.get("wind_speed_ms"),
            "aqi": weather.get("aqi"),
        }
        if weather
        else {},

        "forecast": [
            {
                "date": day.get("date"),
                "condition": day.get("condition"),
                "temp_max_c": day.get("temp_max_c"),
                "temp_min_c": day.get("temp_min_c"),
                "temp_ml_predicted": day.get("temp_ml_predicted"),
                "precipitation_mm": day.get("precipitation_mm"),
                "rain_probability": day.get("rain_probability"),
            }
            for day in available_forecast[:7]
        ],

        "available_forecast_dates": [
            day.get("date")
            for day in available_forecast[:7]
        ],

        "ml_confidence": forecast.get(
            "ml_confidence"
        ) if forecast else None,

        "advisory": advisory or {},

        "disaster": disaster or {},
    }


async def answer_voice_query(
    query: str,
    context: dict,
) -> str:

    clean_query = sanitize_voice_query(
        query
    ).lower()

    requested_date = extract_requested_date(
        clean_query
    )

    matched_forecast = None

    available_forecasts = context.get(
        "forecast",
        []
    )

    if requested_date:

        for day in available_forecasts:

            if day.get("date") == requested_date:
                matched_forecast = day
                break

    system = """
You are SkyLens, an intelligent AI weather assistant.

IMPORTANT RULES:
- Keep responses concise.
- Maximum 3-4 lines.
- Sound natural and conversational.
- Directly answer the user's question.
- Use forecast data when available.
- If exact future forecast is unavailable, use:
  - current weather
  - forecast trends
  - ML predicted temperatures
  - weather patterns
  to provide a reasonable estimate or guidance.

NEVER:
- say "404"
- expose backend errors
- expose technical failures
- sound robotic

If data is limited:
- answer using whatever useful weather information exists.
- politely mention uncertainty if needed.

Examples:

User:
"What will weather be like on 25th May?"

Assistant:
"Exact forecast data for that date is limited right now, but current trends suggest continued hot conditions with low rainfall chances."

User:
"Can I go to college tomorrow?"

Assistant:
"Tomorrow may feel quite warm during daytime hours with somewhat uncomfortable outdoor conditions. Carrying water and avoiding prolonged heat exposure would be a good idea."

Keep answers intelligent, practical, and concise.
"""

    user_prompt = f"""
USER QUESTION:
{clean_query}

REQUESTED DATE:
{requested_date}

MATCHED FORECAST:
{matched_forecast}

AVAILABLE FORECASTS:
{available_forecasts}

FULL WEATHER CONTEXT:
{context}

Answer naturally in under 4 lines.
"""

    text = await call_groq_safe(
        system,
        user_prompt,
        max_tokens=140,
    )

    if text and len(text.strip()) > 10:
        return text.strip()

    current = context.get(
        "current_weather",
        {}
    )

    if current:

        return (
            f"{current.get('city', 'This location')} "
            f"is currently "
            f"{current.get('condition', 'showing variable weather')} "
            f"with temperatures near "
            f"{current.get('temperature_c', '--')}°C."
        )

    return (
        "Weather information is currently limited. "
        "Please try again in a moment."
    )


def voice_cache_key(
    query: str,
    city: str,
) -> str:

    digest = hashlib.md5(
        f"{query}:{city}".encode("utf-8")
    ).hexdigest()[:12]

    return f"voice:{digest}"