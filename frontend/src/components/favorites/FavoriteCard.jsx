import { Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useFavoritesStore } from '../../store/useFavoritesStore'
import { useWeatherStore } from '../../store/useWeatherStore'
import WeatherIcon from '../common/WeatherIcon'

export default function FavoriteCard({ favorite }) {
  const setCity = useWeatherStore((state) => state.setCity)
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite)
  const closePanel = useFavoritesStore((state) => state.closePanel)

  return (
    <motion.article whileHover={{ x: -4 }} className="glass-card flex cursor-pointer items-center gap-3 rounded-xl p-3" onClick={() => { setCity(favorite.city); closePanel() }}>
      <WeatherIcon icon={favorite.conditionIcon} condition={favorite.condition} size="small" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">{favorite.city}, {favorite.country}</p>
        <p className="text-xs text-slate-400">{Math.round(favorite.temp)}C - {favorite.condition}</p>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          removeFavorite(favorite.city)
        }}
        className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"
        aria-label={`Remove ${favorite.city}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.article>
  )
}

