const legends = {
  temp_new: ['Cold', 'Mild', 'Hot'],
  precipitation_new: ['Dry', 'Rain', 'Heavy'],
  clouds_new: ['Clear', 'Partly', 'Overcast'],
  wind_new: ['Calm', 'Breezy', 'Strong'],
  pressure_new: ['Low', 'Normal', 'High'],
}

export default function MapLegend({ layer }) {
  const labels = legends[layer] || legends.temp_new
  return (
    <div className="absolute bottom-3 left-3 z-[1000] w-56 rounded-xl border border-slate-700 bg-slate-950/80 p-3 backdrop-blur">
      <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-emerald-400 to-orange-500" />
      <div className="mt-2 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-300">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}

