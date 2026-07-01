import { GraduationCap, Loader2 } from 'lucide-react'
import { useAdvisoryStore } from '../../store/useAdvisoryStore'
import AdvisoryGroqSummary from './AdvisoryGroqSummary'
import AdvisoryTimeline from './AdvisoryTimeline'

const badgeClass = {
  GREEN: 'bg-emerald-500/15 text-emerald-200',
  YELLOW: 'bg-amber-500/15 text-amber-100',
  ORANGE: 'bg-orange-500/15 text-orange-100',
  RED: 'bg-red-500/15 text-red-100',
}

export default function AdvisoryPanel() {
  const advisory = useAdvisoryStore((state) => state.advisory)
  const loading = useAdvisoryStore((state) => state.loading)
  const error = useAdvisoryStore((state) => state.error)

  return (
    <section id="advisory-panel" className="glass-card rounded-xl p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300"><GraduationCap className="h-4 w-4" /> School & College Advisory</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Attendance and commute intelligence</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">Risk scores estimate how strongly the forecast may disrupt school, college, commute, or outdoor activity. Green is low, yellow is watch, orange is caution, red is avoid/act.</p>
        </div>
        {advisory && <span className={`rounded-full px-3 py-1.5 text-xs font-black ${badgeClass[advisory.overall_risk]}`}>{advisory.overall_risk} RISK</span>}
      </div>
      {loading && <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Building advisory scores...</div>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {advisory && <><AdvisoryTimeline /><AdvisoryGroqSummary /></>}
    </section>
  )
}
