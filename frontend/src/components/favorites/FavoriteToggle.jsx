import { Star } from 'lucide-react'
import { useFavoritesStore } from '../../store/useFavoritesStore'
import { useWeatherStore } from '../../store/useWeatherStore'

export default function FavoriteToggle() {
  const weather = useWeatherStore((state) => state.weather)
  const favorites = useFavoritesStore((state) => state.favorites)
  const addFavorite = useFavoritesStore((state) => state.addFavorite)
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite)
  if (!weather) return null

  const isFavorite = favorites.some((item) => item.city.toLowerCase() === weather.city.toLowerCase())
  return (
    <button
      type="button"
      onClick={() => (isFavorite ? removeFavorite(weather.city) : addFavorite(weather.city))}
      className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/25"
      aria-label={isFavorite ? 'Remove favorite city' : 'Add favorite city'}
    >
      <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-300 text-amber-300' : ''}`} />
      {isFavorite ? 'Saved' : 'Save'}
    </button>
  )
}

