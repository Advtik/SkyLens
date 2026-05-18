import { FORECAST_TABS } from '../../utils/constants'

export default function ForecastTabs({ activeTab, onChange }) {
  return (
    <div className="scrollbar-hide sticky top-20 z-20 flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-slate-950/70 p-2 backdrop-blur">
      {FORECAST_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`min-h-11 rounded-xl px-4 text-sm font-bold transition ${
            activeTab === tab.key ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

