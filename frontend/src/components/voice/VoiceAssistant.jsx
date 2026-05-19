import { Loader2, Send, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { detectIntent, fetchVoiceResponse } from '../../api/voice'
import useVoiceRecognition from '../../hooks/useVoiceRecognition'
import { useAdvisoryStore } from '../../store/useAdvisoryStore'
import { useDisasterStore } from '../../store/useDisasterStore'
import { useVoiceStore } from '../../store/useVoiceStore'
import { useWeatherStore } from '../../store/useWeatherStore'
import { speak } from '../../utils/tts'
import VoiceButton from './VoiceButton'
import VoiceResponseCard from './VoiceResponseCard'
import VoiceTranscript from './VoiceTranscript'

export default function VoiceAssistant() {
  const [typed, setTyped] = useState('')
  const panelOpen = useVoiceStore((state) => state.panelOpen)
  const listening = useVoiceStore((state) => state.listening)
  const processing = useVoiceStore((state) => state.processing)
  const error = useVoiceStore((state) => state.error)
  const togglePanel = useVoiceStore((state) => state.togglePanel)
  const setProcessing = useVoiceStore((state) => state.setProcessing)
  const pushTranscript = useVoiceStore((state) => state.pushTranscript)
  const setResponse = useVoiceStore((state) => state.setResponse)
  const setLastIntent = useVoiceStore((state) => state.setLastIntent)
  const setError = useVoiceStore((state) => state.setError)
  const city = useWeatherStore((state) => state.city)
  const setCity = useWeatherStore((state) => state.setCity)
  const advisory = useAdvisoryStore((state) => state.advisory)
  const disaster = useDisasterStore((state) => state.assessment)
  const openDisasterDetails = useDisasterStore((state) => state.openDetails)

  const processQuery = useCallback(async (query) => {
    const clean = query.trim()
    if (!clean) return
    const intent = detectIntent(clean)
    setLastIntent(intent)
    pushTranscript({ role: 'user', text: clean })
    setProcessing(true)
    setError(null)
    try {
      if (intent.type === 'advisory') document.getElementById('advisory-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (intent.type === 'disaster') openDisasterDetails()
      const response = await fetchVoiceResponse({
        query: clean,
        city: intent.city || city || 'Delhi',
        includeAdvisory: Boolean(advisory),
        includeDisaster: Boolean(disaster),
      })
      if (response.city && response.city.toLowerCase() !== (city || '').toLowerCase()) await setCity(response.city)
      setResponse(response.response)
      pushTranscript({ role: 'assistant', text: response.response })
      speak(response.response)
    } catch (err) {
      setError(err.message || 'Voice assistant failed.')
    } finally {
      setProcessing(false)
    }
  }, [advisory, city, disaster, openDisasterDetails, pushTranscript, setCity, setError, setLastIntent, setProcessing, setResponse])

  const { startListening, stopListening, supported } = useVoiceRecognition(processQuery)
  const toggleListening = useCallback(() => {
    if (listening) stopListening()
    else startListening()
  }, [listening, startListening, stopListening])

  return (
    <AnimatePresence>
      {panelOpen && (
        <motion.aside
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          className="fixed inset-x-3 bottom-4 z-50 rounded-xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur md:left-auto md:right-5 md:w-96"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-300">Voice assistant</p>
              <h2 className="text-xl font-bold text-white">Ask SkyLens</h2>
            </div>
            <button type="button" onClick={togglePanel} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="Close voice assistant"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3">
            <VoiceTranscript />
            <VoiceResponseCard />
            {listening && <p className="rounded-lg bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-100">Listening... click Stop when you are done. I will auto-stop after 1 minute.</p>}
            {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>}
            <div className="flex gap-2">
              <input value={typed} onChange={(event) => setTyped(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { processQuery(typed); setTyped('') } }} placeholder={supported ? 'Type instead...' : 'Voice unsupported, type here...'} className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-sky-400" />
              <button type="button" onClick={() => { processQuery(typed); setTyped('') }} className="rounded-xl bg-sky-500/20 px-3 text-sky-100 hover:bg-sky-500/30" aria-label="Send voice query"><Send className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center justify-between">
              <VoiceButton compact={false} onListen={toggleListening} />
              {processing && <span className="inline-flex items-center gap-2 text-xs text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Thinking...</span>}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
