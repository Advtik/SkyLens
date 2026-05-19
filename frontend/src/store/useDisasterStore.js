import { create } from 'zustand'

export const useDisasterStore = create((set) => ({
  assessment: null,
  alerts: [],
  loading: false,
  error: null,
  detailsOpen: false,
  dismissedCities: [],
  setAssessment: (assessment) => set({ assessment, alerts: assessment?.alerts ?? [], loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  openDetails: () => set({ detailsOpen: true }),
  closeDetails: () => set({ detailsOpen: false }),
  dismiss: (city) => set((state) => ({ dismissedCities: [...new Set([...state.dismissedCities, city])], detailsOpen: false })),
  reset: () => set({ assessment: null, alerts: [], error: null, detailsOpen: false }),
}))

