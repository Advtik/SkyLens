export const getAqiColor = (value) => {
  if (value <= 1) return '#10B981'
  if (value <= 2) return '#84CC16'
  if (value <= 3) return '#F59E0B'
  if (value <= 4) return '#EF4444'
  return '#8B5CF6'
}

export const getUvColor = (value) => {
  if (value < 3) return '#10B981'
  if (value < 6) return '#F59E0B'
  if (value < 8) return '#F97316'
  if (value < 11) return '#EF4444'
  return '#8B5CF6'
}

export const getHeroClass = (weather) => {
  const condition = weather?.condition?.toLowerCase() || ''
  const temp = weather?.temp_c ?? 0
  if (temp > 35) return 'hero-hot'
  if (condition.includes('thunder')) return 'hero-thunderstorm'
  if (condition.includes('snow')) return 'hero-snow'
  if (condition.includes('rain') || condition.includes('drizzle')) return 'hero-rain'
  if (condition.includes('mist') || condition.includes('fog')) return 'hero-mist'
  if (condition.includes('cloud')) return weather?.cloud_cover_pct > 80 ? 'hero-overcast' : 'hero-clouds'
  return 'hero-clear'
}

