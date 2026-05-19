import { create } from 'zustand'

export const useUIStore = create((set) => ({
  activeForecastTab: 'overview',
  activeMapLayer: 'temp_new',
  tempUnit: 'C',
  voiceButtonVisible: true,
  advisoryExpanded: true,
  setForecastTab: (tab) => set({ activeForecastTab: tab }),
  setMapLayer: (layer) => set({ activeMapLayer: layer }),
  setAdvisoryExpanded: (advisoryExpanded) => set({ advisoryExpanded }),
  toggleTempUnit: () => set((state) => ({ tempUnit: state.tempUnit === 'C' ? 'F' : 'C' })),
}))

