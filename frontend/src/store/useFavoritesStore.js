import { create } from 'zustand'
import { fetchWeather } from '../api/weather'

const STORAGE_KEY = 'skylens_favorites_v1'

const save = (favorites) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // localStorage can be blocked in private browsing.
  }
}

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(raw)) return []
    return raw.filter((item) => typeof item.city === 'string' && item.city.length > 0 && item.city.length < 100).slice(0, 10)
  } catch {
    return []
  }
}

export const useFavoritesStore = create((set, get) => ({
  favorites: load(),
  panelOpen: false,
  error: null,

  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
  closePanel: () => set({ panelOpen: false }),

  addFavorite: async (cityName) => {
    const existing = get().favorites.some((item) => item.city.toLowerCase() === cityName.toLowerCase())
    if (existing || get().favorites.length >= 10) return
    try {
      const weather = await fetchWeather(cityName)
      const entry = {
        city: weather.city,
        country: weather.country,
        temp: weather.temp_c,
        condition: weather.condition,
        conditionIcon: weather.condition_icon,
        lastUpdated: Date.now(),
      }
      const updated = [...get().favorites, entry]
      set({ favorites: updated, error: null })
      save(updated)
    } catch {
      set({ error: 'Could not add favorite city.' })
    }
  },

  removeFavorite: (cityName) => {
    const updated = get().favorites.filter((item) => item.city.toLowerCase() !== cityName.toLowerCase())
    set({ favorites: updated })
    save(updated)
  },

  refreshAll: async () => {
    const current = get().favorites
    const results = await Promise.allSettled(current.map((item) => fetchWeather(item.city)))
    const updated = current.map((favorite, index) => {
      const result = results[index]
      if (result.status !== 'fulfilled') return favorite
      const weather = result.value
      return { ...favorite, temp: weather.temp_c, condition: weather.condition, conditionIcon: weather.condition_icon, country: weather.country, lastUpdated: Date.now() }
    })
    set({ favorites: updated })
    save(updated)
  },
}))

