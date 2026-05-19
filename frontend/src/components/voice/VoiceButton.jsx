import { Mic, MicOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useVoiceStore } from '../../store/useVoiceStore'

export default function VoiceButton({ compact = true, onListen }) {
  const listening = useVoiceStore((state) => state.listening)
  const togglePanel = useVoiceStore((state) => state.togglePanel)

  return (
    <motion.button
      type="button"
      animate={listening ? { scale: [1, 1.12, 1] } : {}}
      transition={{ repeat: listening ? Infinity : 0, duration: 1.2 }}
      onClick={onListen || togglePanel}
      className={`${compact ? 'h-11 w-11' : 'h-14 px-5'} inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500/20 font-bold text-sky-100 hover:bg-sky-500/30`}
      aria-label={listening ? 'Stop listening' : 'Open voice assistant'}
    >
      {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      {!compact && <span>{listening ? 'Stop mic' : 'Ask SkyLens'}</span>}
    </motion.button>
  )
}
