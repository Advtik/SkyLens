import { useUIStore } from '../store/useUIStore'

export default function useMapLayers() {
  return useUIStore((state) => ({
    activeMapLayer: state.activeMapLayer,
    setMapLayer: state.setMapLayer,
  }))
}

