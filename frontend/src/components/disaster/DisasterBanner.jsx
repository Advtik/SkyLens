import { AlertTriangle, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDisasterStore } from '../../store/useDisasterStore'
import { useWeatherStore } from '../../store/useWeatherStore'
import DisasterAlertCard from './DisasterAlertCard'
import DisasterGroqSummary from './DisasterGroqSummary'

export default function DisasterBanner() {
  const city = useWeatherStore((state) => state.weather?.city)
  const alerts = useDisasterStore((state) => state.alerts)
  const assessment = useDisasterStore((state) => state.assessment)
  const detailsOpen = useDisasterStore((state) => state.detailsOpen)
  const dismissed = useDisasterStore((state) => state.dismissedCities)
  const openDetails = useDisasterStore((state) => state.openDetails)
  const closeDetails = useDisasterStore((state) => state.closeDetails)
  const dismiss = useDisasterStore((state) => state.dismiss)
  const visibleAlerts = dismissed.includes(city) ? [] : alerts

  return (
    <>
      <AnimatePresence>
        {visibleAlerts.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="sticky top-[88px] z-30 border-b border-red-500/40 bg-red-950/90 px-4 py-3 backdrop-blur md:top-[89px]">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 animate-pulse text-red-300" />
                <span className="text-sm font-black uppercase tracking-wide text-red-100">{visibleAlerts[0].type} risk detected - {visibleAlerts[0].risk_level}</span>
              </div>
              <div className="flex gap-3 md:ml-auto">
                <button type="button" onClick={openDetails} className="text-xs font-bold text-red-200 underline">View details</button>
                <button type="button" onClick={() => dismiss(city)} className="text-xs font-bold text-red-200">Dismiss</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {detailsOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-950/70 p-4 backdrop-blur">
            <motion.div initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} className="ml-auto h-full max-w-xl overflow-y-auto rounded-xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-red-300">Disaster warning system</p>
                  <h2 className="text-2xl font-bold text-white">{city} risk details</h2>
                </div>
                <button type="button" onClick={closeDetails} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="Close disaster details"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                {visibleAlerts.map((alert) => <DisasterAlertCard key={`${alert.date}-${alert.type}`} alert={alert} />)}
                <DisasterGroqSummary text={assessment?.groq_explanation} />
                {assessment && <p className="text-xs text-slate-500">Anomaly score: {assessment.anomaly_score}/100 - ML confidence: {Math.round(assessment.ml_confidence * 100)}%</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

