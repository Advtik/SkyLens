import { motion } from 'framer-motion'

const colorFor = (value) => {
  if (value < 30) return 'bg-emerald-400'
  if (value < 55) return 'bg-amber-400'
  if (value < 75) return 'bg-orange-500'
  return 'bg-red-500'
}

export default function AdvisoryRiskBar({ label, description, value, index = 0 }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">{label}</span>
        <span className="text-slate-400">{Math.round(value)}%</span>
      </div>
      {description && <p className="mb-2 text-[11px] leading-snug text-slate-500">{description}</p>}
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, value)}%` }} transition={{ delay: index * 0.04 }} className={`h-full rounded-full ${colorFor(value)}`} />
      </div>
    </div>
  )
}
