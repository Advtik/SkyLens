import { CloudLightning } from 'lucide-react'

export default function DisasterAlertCard({ alert }) {
  return (
    <article className="rounded-xl border border-red-400/20 bg-red-950/25 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CloudLightning className="h-5 w-5 text-red-300" />
          <h3 className="text-lg font-black capitalize text-white">{alert.type} risk</h3>
        </div>
        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-black text-red-100">{alert.risk_level}</span>
      </div>
      <p className="text-sm text-slate-300">{alert.date} - {Math.round(alert.confidence)}% confidence</p>
      <ul className="mt-3 space-y-2 text-sm text-slate-300">
        {alert.triggered_features.length ? alert.triggered_features.map((item) => <li key={item}>- {item}</li>) : <li>- Pattern-based weather risk detected from forecast features.</li>}
      </ul>
    </article>
  )
}

