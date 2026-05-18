import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useUIStore } from '../../store/useUIStore'
import { useWeatherStore } from '../../store/useWeatherStore'
import LayerControl from './LayerControl'
import MapLegend from './MapLegend'

const OWM_KEY = import.meta.env.VITE_OWM_KEY

function MapCenterUpdater({ center }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 9, { duration: 1.5 })
  }, [center, map])
  return null
}

export default function WeatherMap() {
  const coordinates = useWeatherStore((state) => state.coordinates)
  const weather = useWeatherStore((state) => state.weather)
  const activeMapLayer = useUIStore((state) => state.activeMapLayer)
  const center = coordinates ? [coordinates.lat, coordinates.lon] : [20, 0]

  return (
    <section className="glass-card overflow-hidden rounded-xl p-3">
      <div className="mb-3 flex flex-col gap-1 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-sky-300">Interactive weather map</p>
          <h2 className="text-2xl font-bold text-white">{weather?.city || 'Global'} radar layers</h2>
        </div>
        <p className="text-sm text-slate-400">OpenStreetMap base with OpenWeatherMap overlays</p>
      </div>
      <div className="relative h-[320px] overflow-hidden rounded-xl md:h-[450px]">
        <MapContainer center={center} zoom={7} minZoom={3} maxZoom={12} className="h-full w-full">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap & CartoDB"
          />
          {OWM_KEY && (
            <TileLayer
              key={activeMapLayer}
              url={`https://tile.openweathermap.org/map/${activeMapLayer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`}
              opacity={1}
              zIndex={10}
            />
          )}
          <MapCenterUpdater center={center} />
        </MapContainer>
        <LayerControl />
        <MapLegend layer={activeMapLayer} />
        {!OWM_KEY && (
          <div className="absolute inset-x-3 top-3 z-[900] rounded-xl border border-amber-400/30 bg-amber-950/80 px-3 py-2 text-xs font-semibold text-amber-100 backdrop-blur md:left-3 md:right-auto">
            Add VITE_OWM_KEY to show weather tile overlays.
          </div>
        )}
      </div>
    </section>
  )
}

