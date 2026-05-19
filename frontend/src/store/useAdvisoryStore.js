import { create } from 'zustand'

export const useAdvisoryStore = create((set) => ({
  advisory: null,
  loading: false,
  error: null,
  selectedDate: null,
  setAdvisory: (advisory) => set({ advisory, loading: false, error: null, selectedDate: advisory?.days?.[0]?.date ?? null }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  reset: () => set({ advisory: null, error: null, selectedDate: null }),
}))

