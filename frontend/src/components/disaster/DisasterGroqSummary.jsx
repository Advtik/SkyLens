import { Bot } from 'lucide-react'

export default function DisasterGroqSummary({ text }) {
  if (!text) return null
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-red-200">
        <Bot className="h-4 w-4" />
        AI risk briefing
      </div>
      <p className="text-sm leading-6 text-slate-300">{text}</p>
    </div>
  )
}

