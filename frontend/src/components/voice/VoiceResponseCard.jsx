import { CloudSun } from 'lucide-react'
import { useVoiceStore } from '../../store/useVoiceStore'
import { useWeatherStore } from '../../store/useWeatherStore'

export default function VoiceResponseCard() {
  const response = useVoiceStore((state) => state.response)
  const weather = useWeatherStore((state) => state.weather)
  if (!response && !weather) return null
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      {weather && (
        <div className="mb-3 flex items-center gap-3">
          <CloudSun className="h-5 w-5 text-sky-300" />
          <div>
            <p className="text-sm font-bold text-white">{weather.city}</p>
            <p className="text-xs text-slate-400">{Math.round(weather.temp_c)}C - {weather.condition}</p>
          </div>
        </div>
      )}
      {response && <p className="text-sm leading-6 text-slate-300">{response}</p>}
    </div>
  )
}

