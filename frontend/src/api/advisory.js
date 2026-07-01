import { API_BASE_URL } from './config'

export const fetchAdvisory = async (city) => {
  const res = await fetch(`${API_BASE_URL}/api/advisory?city=${encodeURIComponent(city)}`)
  if (!res.ok) throw new Error(`Advisory service error: ${res.status}`)
  return res.json()
}
