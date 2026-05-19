import { Bookmark, RefreshCw, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useFavoritesStore } from '../../store/useFavoritesStore'
import { useWeatherStore } from '../../store/useWeatherStore'
import FavoriteCard from './FavoriteCard'

export function FavoritesButton() {
  const togglePanel = useFavoritesStore((state) => state.togglePanel)
  const count = useFavoritesStore((state) => state.favorites.length)
  return (
    <button type="button" onClick={togglePanel} className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-slate-200 hover:bg-white/15" aria-label="Open favorite cities">
      <Bookmark className="h-5 w-5" />
      {count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-sky-500 px-1.5 text-[10px] font-bold text-white">{count}</span>}
    </button>
  )
}

export default function FavoritesPanel() {
  const panelOpen = useFavoritesStore((state) => state.panelOpen)
  const favorites = useFavoritesStore((state) => state.favorites)
  const closePanel = useFavoritesStore((state) => state.closePanel)
  const refreshAll = useFavoritesStore((state) => state.refreshAll)
  const addFavorite = useFavoritesStore((state) => state.addFavorite)
  const weather = useWeatherStore((state) => state.weather)

  useEffect(() => {
    if (panelOpen) refreshAll()
  }, [panelOpen, refreshAll])

  return (
    <AnimatePresence>
      {panelOpen && (
        <motion.aside
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          className="fixed inset-x-3 bottom-3 z-50 max-h-[72vh] overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur md:inset-x-auto md:right-5 md:top-24 md:w-96"
        >
          <div className="mb-4 flex items-center gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-300">Favorite cities</p>
              <h2 className="text-xl font-bold text-white">Quick weather jumps</h2>
            </div>
            <button type="button" onClick={refreshAll} className="ml-auto rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="Refresh favorites">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button type="button" onClick={closePanel} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="Close favorites">
              <X className="h-4 w-4" />
            </button>
          </div>
          {weather && (
            <button type="button" onClick={() => addFavorite(weather.city)} className="mb-4 w-full rounded-xl bg-sky-500/15 px-4 py-3 text-sm font-bold text-sky-100 hover:bg-sky-500/25">
              Add {weather.city}
            </button>
          )}
          <div className="scrollbar-hide max-h-[48vh] space-y-3 overflow-y-auto">
            {favorites.length ? favorites.map((favorite) => <FavoriteCard key={favorite.city} favorite={favorite} />) : <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-400">No saved cities yet.</p>}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

