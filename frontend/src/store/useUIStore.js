import { create } from 'zustand'

export const useUIStore = create((set) => ({
  activeForecastTab: 'overview',
  activeMapLayer: 'temp_new',
  tempUnit: 'C',
  setForecastTab: (tab) => set({ activeForecastTab: tab }),
  setMapLayer: (layer) => set({ activeMapLayer: layer }),
  toggleTempUnit: () => set((state) => ({ tempUnit: state.tempUnit === 'C' ? 'F' : 'C' })),
}))

