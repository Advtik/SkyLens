import { useEffect, useState } from 'react'
import { Loader2, MapPin, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { searchCities } from '../../api/geocoding'
import useDebounce from '../../hooks/useDebounce'
import { useWeatherStore } from '../../store/useWeatherStore'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const debounced = useDebounce(query, 400)
  const setCity = useWeatherStore((state) => state.setCity)

  useEffect(() => {
    let active = true
    const run = async () => {
      if (debounced.trim().length < 2) {
        setSuggestions([])
        return
      }
      setSearching(true)
      const results = await searchCities(debounced)
      if (active) {
        setSuggestions(results)
        setSearching(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [debounced])

  const submitCity = (cityName = query) => {
    if (!cityName.trim()) return
    setQuery(cityName)
    setSuggestions([])
    setCity(cityName)
  }

  return (
    <div className="relative w-full max-w-xl">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submitCity()
        }}
        className="glass-card flex h-12 items-center gap-3 rounded-xl px-4 focus-within:border-sky-300/60"
      >
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search city..."
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          aria-label="Search city"
        />
        {searching && <Loader2 className="h-4 w-4 animate-spin text-sky-300" />}
      </form>

      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur"
        >
          {suggestions.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => submitCity(item.city)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-white/10"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{item.city}</span>
                <span className="block truncate text-xs text-slate-400">{item.country || item.name}</span>
              </span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

