import { create } from 'zustand'

export const useVoiceStore = create((set) => ({
  panelOpen: false,
  listening: false,
  processing: false,
  transcript: [],
  lastIntent: null,
  response: '',
  error: null,

  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
  openPanel: () => set({ panelOpen: true }),
  setListening: (listening) => set({ listening }),
  setProcessing: (processing) => set({ processing }),
  pushTranscript: (entry) => set((state) => ({ transcript: [...state.transcript.slice(-19), { ...entry, timestamp: Date.now() }] })),
  setLastIntent: (lastIntent) => set({ lastIntent }),
  setResponse: (response) => set({ response }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))

