import { motion } from 'framer-motion'
import { useUIStore } from '../../store/useUIStore'
import { useWeatherStore } from '../../store/useWeatherStore'
import { convertTemp, tempUnitSymbol } from '../../utils/formatters'
import WeatherIcon from '../common/WeatherIcon'

function precipitationLabel(point) {
  const amount = Number(point.precipitation_mm || 0)
  const probability = point.precipitation_probability
  if (amount > 0 && amount < 0.1) return '<0.1 mm'
  if (amount >= 0.1) return `${amount.toFixed(amount >= 1 ? 1 : 1)} mm`
  if (probability >= 20) return `${probability}% rain`
  return 'No rain'
}

function HourlyItem({ point, tempUnit }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="glass-card min-w-24 rounded-xl p-3 text-center">
      <p className="text-xs font-semibold text-slate-400">{point.time_label}</p>
      <div className="mx-auto my-1 flex justify-center">
        <WeatherIcon icon={point.condition_icon} size="small" />
      </div>
      <p className="text-lg font-bold text-white">
        {convertTemp(point.temp_c, tempUnit)}
        {tempUnitSymbol(tempUnit)}
      </p>
      <p className="text-xs text-slate-400">{precipitationLabel(point)}</p>
    </motion.div>
  )
}

export default function HourlyStrip() {
  const hourly = useWeatherStore((state) => state.forecast?.hourly ?? [])
  const tempUnit = useUIStore((state) => state.tempUnit)
  if (!hourly.length) return null

  return (
    <section className="relative">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Next 24 Hours</h2>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Hourly</span>
      </div>
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.03 } } }} className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
        {hourly.slice(0, 24).map((point) => (
          <HourlyItem key={point.timestamp} point={point} tempUnit={tempUnit} />
        ))}
      </motion.div>
    </section>
  )
}
