import { Cloud, Droplets, Eye, Gauge, Leaf, Thermometer, Umbrella, Wind } from 'lucide-react'
import { useUIStore } from '../../store/useUIStore'
import { useWeatherStore } from '../../store/useWeatherStore'
import { convertTemp, metersToKm, msToKmh, tempUnitSymbol } from '../../utils/formatters'
import MetricCard from './MetricCard'

export default function MetricsGrid() {
  const weather = useWeatherStore((state) => state.weather)
  const tempUnit = useUIStore((state) => state.tempUnit)
  if (!weather) return null

  const cards = [
    { icon: Thermometer, label: 'Feels Like', value: convertTemp(weather.feels_like_c, tempUnit), unit: tempUnitSymbol(tempUnit), description: 'Perceived temperature with humidity and wind.', color: 'text-orange-300' },
    { icon: Droplets, label: 'Humidity', value: weather.humidity, unit: '%', description: 'Moisture content in the current air mass.', color: 'text-cyan-300' },
    { icon: Leaf, label: 'AQI', value: weather.aqi, unit: weather.aqi_label, description: `PM2.5 ${weather.pm25 ?? '--'} / PM10 ${weather.pm10 ?? '--'}`, color: 'text-emerald-300' },
    { icon: Umbrella, label: 'UV Index', value: weather.uv_index, unit: weather.uv_label, description: 'Daily ultraviolet exposure level.', color: 'text-amber-300' },
    { icon: Wind, label: 'Wind', value: msToKmh(weather.wind_speed_ms), unit: '', description: `${weather.wind_direction_deg}° direction at surface level.`, color: 'text-teal-300' },
    { icon: Cloud, label: 'Clouds', value: weather.cloud_cover_pct, unit: '%', description: 'Current cloud cover over the selected city.', color: 'text-slate-200' },
    { icon: Eye, label: 'Visibility', value: metersToKm(weather.visibility_m), unit: '', description: 'Horizontal visibility reported by the station.', color: 'text-blue-200' },
    { icon: Gauge, label: 'Pressure', value: weather.pressure_hpa, unit: 'hPa', description: 'Mean sea-level atmospheric pressure.', color: 'text-violet-300' },
  ]

  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </section>
  )
}

