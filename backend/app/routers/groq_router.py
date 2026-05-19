import re

from fastapi import APIRouter

from app.schemas.advisory import (
    VoiceQueryRequest,
    VoiceQueryResponse,
)

from app.services import cache

from app.services.groq_service import (
    answer_voice_query,
    build_voice_context,
    sanitize_voice_query,
    voice_cache_key,
)

router = APIRouter()


def _clean_city(value: str | None) -> str | None:

    if not value:
        return None

    city = re.sub(
        r"\b(today|tomorrow|now|please|this week|next week|weather|forecast|temperature|humidity|rain|safe|dangerous|risky)\b",
        "",
        value,
        flags=re.I,
    )

    city = re.sub(
        r"[?.!,]",
        "",
        city,
    )

    city = re.sub(
        r"\s+",
        " ",
        city,
    ).strip()

    return city or None


def _requested_city(
    query: str,
    fallback_city: str,
) -> str:

    clean = sanitize_voice_query(query)

    blacklist = {
        "school",
        "college",
        "today",
        "tomorrow",
        "now",
        "weather",
        "forecast",
        "temperature",
        "humidity",
        "rain",
        "safe",
        "dangerous",
        "risky",
        "outside",
        "storm",
        "heatwave",
        "alert",
        "warning",
    }

    patterns = [
        r"\bin\s+([a-zA-Z .'-]+)",
        r"\bfor\s+([a-zA-Z .'-]+)",
        r"\bat\s+([a-zA-Z .'-]+)",
        r"\bof\s+([a-zA-Z .'-]+)",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            clean,
            flags=re.I,
        )

        if not match:
            continue

        possible_city = (
            match.group(1)
            .strip()
            .title()
        )

        words = []

        for word in possible_city.split():

            if word.lower() in blacklist:
                continue

            words.append(word)

        final_city = " ".join(words)

        if final_city:
            return final_city

    return fallback_city


@router.post(
    "/groq/voice",
    response_model=VoiceQueryResponse,
)
async def handle_voice_query(
    body: VoiceQueryRequest,
) -> VoiceQueryResponse:

    target_city = _requested_city(
        body.query,
        body.city,
    )

    cache_key = voice_cache_key(
        body.query,
        target_city,
    )

    cached = cache.get_cached(cache_key)

    if cached:
        return VoiceQueryResponse(**cached)

    normalized = (
        target_city.strip()
        .lower()
    )

    weather_cached = cache.get_cached(
        f"weather:{normalized}"
    )

    forecast_cached = cache.get_cached(
        f"forecast:{normalized}:7"
    )

    if not weather_cached:

        try:

            from app.routers.weather import (
                get_weather,
            )

            weather_cached = (
                await get_weather(
                    target_city
                )
            ).model_dump()

        except Exception as e:

            print(
                "WEATHER ERROR:",
                str(e),
            )

            weather_cached = {
                "city": target_city,
                "condition": "Unknown",
                "temp_c": "--",
                "humidity": "--",
                "wind_speed_ms": "--",
                "aqi": "--",
            }

    if not forecast_cached:

        try:

            from app.routers.forecast import (
                get_forecast,
            )

            forecast_cached = (
                await get_forecast(
                    target_city,
                    days=7,
                )
            ).model_dump()

        except Exception as e:

            print(
                "FORECAST ERROR:",
                str(e),
            )

            forecast_cached = {
                "daily": [],
                "hourly": [],
                "ml_confidence": None,
            }

    query_lower = body.query.lower()

    wants_advisory = (
        body.include_advisory
        or any(
            word in query_lower
            for word in [
                "school",
                "college",
                "attendance",
                "safe",
                "risky",
            ]
        )
    )

    wants_disaster = (
        body.include_disaster
        or any(
            word in query_lower
            for word in [
                "disaster",
                "warning",
                "alert",
                "flood",
                "storm",
                "heatwave",
            ]
        )
    )

    advisory_cached = (
        cache.get_cached(
            f"advisory:{normalized}"
        )
        if wants_advisory
        else None
    )

    disaster_cached = (
        cache.get_cached(
            f"disaster:{normalized}"
        )
        if wants_disaster
        else None
    )

    if wants_advisory and not advisory_cached:

        try:

            from app.routers.advisory import (
                get_school_advisory,
            )

            advisory_cached = (
                await get_school_advisory(
                    target_city
                )
            ).model_dump()

        except Exception as e:

            print(
                "ADVISORY ERROR:",
                str(e),
            )

            advisory_cached = {}

    if wants_disaster and not disaster_cached:

        try:

            from app.routers.disaster import (
                get_disaster_assessment_route,
            )

            disaster_cached = (
                await get_disaster_assessment_route(
                    target_city
                )
            ).model_dump()

        except Exception as e:

            print(
                "DISASTER ERROR:",
                str(e),
            )

            disaster_cached = {}

    context = build_voice_context(
        weather=weather_cached,
        forecast=forecast_cached,
        advisory=advisory_cached,
        disaster=disaster_cached,
    )

    ai_response = await answer_voice_query(
        body.query,
        context,
    )

    result = {
        "response": ai_response,
        "city": weather_cached.get(
            "city",
            target_city,
        ),
    }

    cache.set_cached(
        cache_key,
        result,
        ttl=300,
    )

    return VoiceQueryResponse(**result)