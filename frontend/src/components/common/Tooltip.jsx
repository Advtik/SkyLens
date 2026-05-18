export default function Tooltip({ children, text }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-52 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-200 opacity-0 shadow-xl transition group-hover:opacity-100">
        {text}
      </span>
    </span>
  )
}

