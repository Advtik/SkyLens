import { CalendarClock, MapPin, RefreshCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUIStore } from '../../store/useUIStore'
import { useWeatherStore } from '../../store/useWeatherStore'
import { getHeroClass } from '../../utils/colorScales'
import { convertTemp, formatTimestamp, tempUnitSymbol } from '../../utils/formatters'
import WeatherIcon from '../common/WeatherIcon'

export default function WeatherHero() {
  const weather = useWeatherStore((state) => state.weather)
  const setCity = useWeatherStore((state) => state.setCity)
  const tempUnit = useUIStore((state) => state.tempUnit)
  const toggleTempUnit = useUIStore((state) => state.toggleTempUnit)

  if (!weather) return null

  return (
    <motion.section
      key={`${weather.city}-${weather.timestamp}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${getHeroClass(weather)} relative overflow-hidden rounded-xl p-6 shadow-glass md:p-8`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_24rem)]" />
      <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm font-semibold">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
              <MapPin className="h-4 w-4" />
              {weather.city}, {weather.country}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
              <CalendarClock className="h-4 w-4" />
              {formatTimestamp(weather.timestamp)}
            </span>
          </div>
          <h1 className="text-5xl font-black md:text-7xl">
            {convertTemp(weather.temp_c, tempUnit)}
            {tempUnitSymbol(tempUnit)}
          </h1>
          <p className="mt-3 text-xl font-bold capitalize">{weather.description}</p>
          <p className="mt-2 max-w-xl text-sm text-white/80">
            Today ranges from {convertTemp(weather.temp_min_c, tempUnit)}
            {tempUnitSymbol(tempUnit)} to {convertTemp(weather.temp_max_c, tempUnit)}
            {tempUnitSymbol(tempUnit)} with {weather.cloud_cover_pct}% cloud cover.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={toggleTempUnit} className="rounded-xl bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/25" aria-label="Toggle temperature unit">
              °C / °F
            </button>
            <button type="button" onClick={() => setCity(weather.city)} className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/25">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
        <WeatherIcon icon={weather.condition_icon} condition={weather.condition} />
      </div>
    </motion.section>
  )
}

