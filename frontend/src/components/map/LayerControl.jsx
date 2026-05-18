import { MAP_LAYERS } from '../../utils/constants'
import useMapLayers from '../../hooks/useMapLayers'

export default function LayerControl() {
  const { activeMapLayer, setMapLayer } = useMapLayers()

  return (
    <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-950/80 p-3 backdrop-blur">
      {MAP_LAYERS.map((layer) => (
        <button
          key={layer.key}
          type="button"
          onClick={() => setMapLayer(layer.key)}
          className={`min-h-10 rounded-lg px-3 text-xs font-bold transition ${
            activeMapLayer === layer.key ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {layer.label}
        </button>
      ))}
    </div>
  )
}

