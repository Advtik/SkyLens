import { motion } from 'framer-motion'

function MetricCard({ icon: Icon, label, value, unit, description, color = 'text-sky-300' }) {
  return (
    <motion.article whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }} className="glass-card rounded-xl p-4 md:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ${color}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-right text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-white md:text-3xl">{value}</span>
        {unit && <span className="pb-1 text-sm font-semibold text-slate-400">{unit}</span>}
      </div>
      <p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">{description}</p>
    </motion.article>
  )
}

export default MetricCard

