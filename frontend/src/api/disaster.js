const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const fetchDisasterAssessment = async (city) => {
  const res = await fetch(`${BASE_URL}/api/disaster?city=${encodeURIComponent(city)}`)
  if (!res.ok) throw new Error(`Disaster service error: ${res.status}`)
  return res.json()
}

