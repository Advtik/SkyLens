export const searchCities = async (query) => {
  if (!query || query.trim().length < 2) return []
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    addressdetails: '1',
    limit: '5',
  })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`)
  if (!res.ok) return []
  const data = await res.json()
  return data.map((item) => ({
    id: item.place_id,
    name: item.display_name,
    city: item.address?.city || item.address?.town || item.address?.village || item.name || query,
    country: item.address?.country || '',
  }))
}

