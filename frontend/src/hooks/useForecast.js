import { useMemo } from 'react'
import { useWeatherStore } from '../store/useWeatherStore'

export default function useForecast() {
  const forecast = useWeatherStore((state) => state.forecast)
  return useMemo(() => forecast?.daily ?? [], [forecast])
}

