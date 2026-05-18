import { useWeatherStore } from '../store/useWeatherStore'

export default function useWeather() {
  return useWeatherStore((state) => ({
    city: state.city,
    weather: state.weather,
    forecast: state.forecast,
    loading: state.loading,
    error: state.error,
    setCity: state.setCity,
  }))
}

