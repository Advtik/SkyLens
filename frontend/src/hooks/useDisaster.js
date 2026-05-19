import { useEffect } from 'react'
import { fetchDisasterAssessment } from '../api/disaster'
import { useDisasterStore } from '../store/useDisasterStore'
import { useWeatherStore } from '../store/useWeatherStore'

export default function useDisaster() {
  const city = useWeatherStore((state) => state.city)
  const weather = useWeatherStore((state) => state.weather)
  const setAssessment = useDisasterStore((state) => state.setAssessment)
  const setLoading = useDisasterStore((state) => state.setLoading)
  const setError = useDisasterStore((state) => state.setError)
  const reset = useDisasterStore((state) => state.reset)

  useEffect(() => {
    if (!city || !weather) {
      reset()
      return undefined
    }
    let cancelled = false
    setLoading(true)
    fetchDisasterAssessment(city)
      .then((data) => {
        if (!cancelled) setAssessment(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [city, weather, reset, setAssessment, setError, setLoading])
}

