import { useAdvisoryStore } from '../../store/useAdvisoryStore'
import { formatDate } from '../../utils/formatters'
import AdvisoryRiskBar from './AdvisoryRiskBar'

const labels = {
  attendance_disrupted: 'Attendance',
  commute_difficult: 'Commute',
  outdoor_unsafe: 'Outdoor',
  heat_stress: 'Heat stress',
  rain_disruption: 'Rain',
  weather_severe: 'Severity',
}

const badgeClass = {
  GREEN: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
  YELLOW: 'bg-amber-500/15 text-amber-100 border-amber-400/30',
  ORANGE: 'bg-orange-500/15 text-orange-100 border-orange-400/30',
  RED: 'bg-red-500/15 text-red-100 border-red-400/30',
}

export default function AdvisoryTimeline() {
  const advisory = useAdvisoryStore((state) => state.advisory)
  const selectedDate = useAdvisoryStore((state) => state.selectedDate)
  const setSelectedDate = useAdvisoryStore((state) => state.setSelectedDate)
  const selected = advisory?.days?.find((day) => day.date === selectedDate) || advisory?.days?.[0]
  if (!advisory || !selected) return null

  return (
    <div>
      <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto">
        {advisory.days.map((day) => (
          <button key={day.date} type="button" onClick={() => setSelectedDate(day.date)} className={`min-w-28 rounded-xl border px-3 py-3 text-left ${selected.date === day.date ? 'border-sky-400 bg-sky-500/15' : 'border-white/10 bg-white/5'}`}>
            <span className="block text-xs font-bold text-white">{formatDate(day.date)}</span>
            <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[10px] font-black ${badgeClass[day.overall_risk]}`}>{day.overall_risk}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(selected.risk_scores).map(([key, value], index) => (
          <AdvisoryRiskBar key={key} label={labels[key] || key} value={value} index={index} />
        ))}
      </div>
      <div className="mt-5">
        <AdvisoryRiskBar label="ML confidence" value={(advisory.ml_confidence || 0) * 100} />
      </div>
    </div>
  )
}

