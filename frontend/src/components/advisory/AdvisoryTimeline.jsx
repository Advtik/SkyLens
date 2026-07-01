import { useAdvisoryStore } from '../../store/useAdvisoryStore'
import { formatDate } from '../../utils/formatters'
import AdvisoryRiskBar from './AdvisoryRiskBar'

const labels = {
  attendance_disrupted: 'Attendance disruption',
  commute_difficult: 'Commute difficulty',
  outdoor_unsafe: 'Outdoor safety',
  heat_stress: 'Heat stress',
  rain_disruption: 'Rain disruption',
  weather_severe: 'Severe weather',
}

const descriptions = {
  attendance_disrupted: 'Chance that weather affects regular attendance.',
  commute_difficult: 'Road and travel discomfort from rain, wind, heat, or visibility.',
  outdoor_unsafe: 'Outdoor activity risk from heat, UV, wind, rain, or storms.',
  heat_stress: 'Heat and humidity strain on students and staff.',
  rain_disruption: 'Rain impact on arrival, dismissal, and outdoor movement.',
  weather_severe: 'Combined signal for potentially disruptive weather.',
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
          <AdvisoryRiskBar key={key} label={labels[key] || key} description={descriptions[key]} value={value} index={index} />
        ))}
      </div>
      <div className="mt-5">
        <AdvisoryRiskBar label="Model confidence" description="How stable the advisory model is for the current data." value={(advisory.ml_confidence || 0) * 100} />
        <div className="mt-3 grid gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:grid-cols-4">
          <span className="rounded-lg bg-emerald-400/10 px-2 py-1 text-emerald-200">0-29 Low</span>
          <span className="rounded-lg bg-amber-400/10 px-2 py-1 text-amber-100">30-54 Watch</span>
          <span className="rounded-lg bg-orange-500/10 px-2 py-1 text-orange-100">55-74 Caution</span>
          <span className="rounded-lg bg-red-500/10 px-2 py-1 text-red-100">75+ High</span>
        </div>
      </div>
    </div>
  )
}
