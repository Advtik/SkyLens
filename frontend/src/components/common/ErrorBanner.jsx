import { AlertCircle, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWeatherStore } from '../../store/useWeatherStore'

export default function ErrorBanner() {
  const error = useWeatherStore((state) => state.error)
  const clearError = useWeatherStore((state) => state.clearError)

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-card mx-auto flex max-w-5xl items-center gap-3 rounded-xl border-red-500/40 bg-red-950/50 px-4 py-3 text-red-100"
        >
          <AlertCircle className="h-5 w-5 text-red-300" />
          <span className="text-sm">{error}</span>
          <button type="button" onClick={clearError} className="ml-auto rounded-lg p-2 text-red-200 hover:bg-white/10" aria-label="Dismiss error">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

