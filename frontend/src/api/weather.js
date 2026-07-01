import { API_BASE_URL } from './config'

const parseApiError = async (res) => {
  let detail = `Weather API error: ${res.status}`
  try {
    const body = await res.json()
    detail = body.detail || detail
  } catch {
    // Keep default response text if JSON parsing fails.
  }
  throw new Error(detail)
}

export const fetchWeather = async (city) => {
  const res = await fetch(`${API_BASE_URL}/api/weather?city=${encodeURIComponent(city)}`)
  if (!res.ok) await parseApiError(res)
  return res.json()
}

export const fetchForecast = async (city, days = 7) => {
  const res = await fetch(`${API_BASE_URL}/api/forecast?city=${encodeURIComponent(city)}&days=${days}`)
  if (!res.ok) await parseApiError(res)
  return res.json()
}

export const fetchHourlyForecast = async (city) => {
  const res = await fetch(`${API_BASE_URL}/api/forecast/hourly?city=${encodeURIComponent(city)}`)
  if (!res.ok) await parseApiError(res)
  return res.json()
}
