import { create } from 'zustand'
import { fetchForecast, fetchWeather } from '../api/weather'

export const useWeatherStore = create((set) => ({
  city: null,
  coordinates: null,
  weather: null,
  forecast: null,
  loading: false,
  error: null,

  setCity: async (cityName) => {
    const nextCity = cityName?.trim()
    if (!nextCity) return
    set({ loading: true, error: null, city: nextCity })
    try {
      const [weather, forecast] = await Promise.all([fetchWeather(nextCity), fetchForecast(nextCity)])
      set({
        weather,
        forecast,
        coordinates: { lat: weather.lat, lon: weather.lon },
        loading: false,
      })
    } catch (err) {
      set({ error: err.message || 'Unable to load weather data.', loading: false })
    }
  },

  clearError: () => set({ error: null }),
}))

