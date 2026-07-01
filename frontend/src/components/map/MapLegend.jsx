const legends = {
  temp_new: {
    labels: ['Cold', 'Mild', 'Hot'],
    units: 'Temperature overlay',
    gradient: 'from-blue-500 via-emerald-400 to-red-500',
  },
  precipitation_new: {
    labels: ['Dry', 'Rain', 'Heavy'],
    units: 'Precipitation intensity',
    gradient: 'from-slate-700 via-sky-400 to-blue-700',
  },
  clouds_new: {
    labels: ['Clear', 'Partly', 'Overcast'],
    units: 'Cloud cover',
    gradient: 'from-slate-900 via-slate-400 to-white',
  },
  wind_new: {
    labels: ['Calm', 'Breezy', 'Strong'],
    units: 'Wind speed',
    gradient: 'from-emerald-400 via-amber-400 to-red-500',
  },
  pressure_new: {
    labels: ['Low', 'Normal', 'High'],
    units: 'Sea-level pressure',
    gradient: 'from-violet-600 via-sky-400 to-amber-300',
  },
}

export default function MapLegend({ layer }) {
  const legend = legends[layer] || legends.temp_new
  return (
    <div className="absolute bottom-3 left-3 z-[1000] w-64 rounded-xl border border-slate-700 bg-slate-950/85 p-3 shadow-2xl backdrop-blur">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{legend.units}</div>
      <div className={`h-3 rounded-full border border-white/20 bg-gradient-to-r ${legend.gradient}`} />
      <div className="mt-2 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-300">
        {legend.labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}
