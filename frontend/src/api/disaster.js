import { API_BASE_URL } from './config'

export const fetchDisasterAssessment = async (city) => {
  const res = await fetch(`${API_BASE_URL}/api/disaster?city=${encodeURIComponent(city)}`)
  if (!res.ok) throw new Error(`Disaster service error: ${res.status}`)
  return res.json()
}
