const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const fetchAdvisory = async (city) => {
  const res = await fetch(`${BASE_URL}/api/advisory?city=${encodeURIComponent(city)}`)
  if (!res.ok) throw new Error(`Advisory service error: ${res.status}`)
  return res.json()
}

