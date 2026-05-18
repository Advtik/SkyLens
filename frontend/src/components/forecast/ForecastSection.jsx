import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '../../store/useUIStore'
import { useWeatherStore } from '../../store/useWeatherStore'
import AQIChart from './charts/AQIChart'
import CloudCoverChart from './charts/CloudCoverChart'
import OverviewChart from './charts/OverviewChart'
import PrecipitationChart from './charts/PrecipitationChart'
import TemperatureChart from './charts/TemperatureChart'
import UVChart from './charts/UVChart'
import WindChart from './charts/WindChart'
import ForecastTabs from './ForecastTabs'

const chartMap = {
  overview: OverviewChart,
  temperature: TemperatureChart,
  aqi: AQIChart,
  wind: WindChart,
  uv: UVChart,
  precipitation: PrecipitationChart,
  clouds: CloudCoverChart,
}

export default function ForecastSection() {
  const activeTab = useUIStore((state) => state.activeForecastTab)
  const setForecastTab = useUIStore((state) => state.setForecastTab)
  const mlConfidence = useWeatherStore((state) => state.forecast?.ml_confidence)
  const ActiveChart = chartMap[activeTab] || OverviewChart

  return (
    <section className="glass-card rounded-xl p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-sky-300">Forecast analytics</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Official forecast with ML trend overlay</h2>
        </div>
        <p className="text-sm text-slate-400">ML confidence {Math.round((mlConfidence || 0) * 100)}%</p>
      </div>
      <ForecastTabs activeTab={activeTab} onChange={setForecastTab} />
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }}>
            <ActiveChart mlConfidence={mlConfidence} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
