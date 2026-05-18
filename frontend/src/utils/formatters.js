export const convertTemp = (value, unit) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '--'
  const celsius = Number(value)
  return unit === 'F' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius)
}

export const tempUnitSymbol = (unit) => `°${unit}`

export const formatDate = (isoDate) =>
  new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(isoDate))

export const formatTimestamp = (timestamp) =>
  new Intl.DateTimeFormat('en', { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp * 1000))

export const metersToKm = (meters) => `${(meters / 1000).toFixed(1)} km`

export const msToKmh = (ms) => `${Math.round(ms * 3.6)} km/h`

