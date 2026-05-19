import { useEffect } from 'react'
import { fetchAdvisory } from '../api/advisory'
import { useAdvisoryStore } from '../store/useAdvisoryStore'
import { useWeatherStore } from '../store/useWeatherStore'

export default function useAdvisory() {
  const city = useWeatherStore((state) => state.city)
  const weather = useWeatherStore((state) => state.weather)
  const setAdvisory = useAdvisoryStore((state) => state.setAdvisory)
  const setLoading = useAdvisoryStore((state) => state.setLoading)
  const setError = useAdvisoryStore((state) => state.setError)
  const reset = useAdvisoryStore((state) => state.reset)

  useEffect(() => {
    if (!city || !weather) {
      reset()
      return undefined
    }
    let cancelled = false
    setLoading(true)
    fetchAdvisory(city)
      .then((data) => {
        if (!cancelled) setAdvisory(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [city, weather, reset, setAdvisory, setError, setLoading])
}

