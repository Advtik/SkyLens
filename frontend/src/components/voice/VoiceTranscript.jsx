import { useVoiceStore } from '../../store/useVoiceStore'

export default function VoiceTranscript() {
  const transcript = useVoiceStore((state) => state.transcript)
  return (
    <div className="scrollbar-hide max-h-56 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-3">
      {transcript.length === 0 ? (
        <p className="text-sm text-slate-400">Ask about weather, forecast, school advisory, or disaster warnings.</p>
      ) : (
        transcript.map((item) => (
          <div key={`${item.timestamp}-${item.text}`} className={`rounded-xl px-3 py-2 text-sm ${item.role === 'user' ? 'ml-8 bg-sky-500/15 text-sky-100' : 'mr-8 bg-white/10 text-slate-200'}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.role}</p>
            {item.text}
          </div>
        ))
      )}
    </div>
  )
}

