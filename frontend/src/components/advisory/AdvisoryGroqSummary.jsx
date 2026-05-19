import { Bot } from 'lucide-react'
import { useAdvisoryStore } from '../../store/useAdvisoryStore'

export default function AdvisoryGroqSummary() {
  const summary = useAdvisoryStore((state) => state.advisory?.groq_summary)
  if (!summary) return null
  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-200">
        <Bot className="h-4 w-4" />
        AI advisory summary
      </div>
      <p className="text-sm leading-6 text-slate-300">{summary}</p>
    </div>
  )
}

