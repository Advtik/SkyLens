import { useCallback, useRef } from 'react'
import { useVoiceStore } from '../store/useVoiceStore'

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
const MAX_LISTEN_MS = 60000

export default function useVoiceRecognition(onTranscript) {
  const recognizerRef = useRef(null)
  const transcriptRef = useRef('')
  const interimRef = useRef('')
  const autoStopRef = useRef(null)
  const keepListeningRef = useRef(false)
  const stoppingRef = useRef(false)
  const setListening = useVoiceStore((state) => state.setListening)
  const setError = useVoiceStore((state) => state.setError)

  const clearTimer = useCallback(() => {
    if (autoStopRef.current) window.clearTimeout(autoStopRef.current)
    autoStopRef.current = null
  }, [])

  const finishTranscript = useCallback(() => {
    const transcript = `${transcriptRef.current} ${interimRef.current}`.replace(/\s+/g, ' ').trim()
    transcriptRef.current = ''
    interimRef.current = ''
    if (transcript) onTranscript(transcript)
  }, [onTranscript])

  const startListening = useCallback(() => {
    if (!Recognition) {
      setError('Voice recognition is not supported in this browser. Type your question instead.')
      return
    }
    if (keepListeningRef.current) return
    transcriptRef.current = ''
    interimRef.current = ''
    keepListeningRef.current = true
    stoppingRef.current = false
    clearTimer()

    const recognizer = new Recognition()
    recognizer.lang = 'en-US'
    recognizer.continuous = true
    recognizer.interimResults = true
    recognizer.maxAlternatives = 1
    recognizer.onstart = () => setListening(true)
    recognizer.onend = () => {
      if (keepListeningRef.current && !stoppingRef.current) {
        window.setTimeout(() => {
          try {
            recognizer.start()
          } catch {
            // Chrome can briefly reject rapid restarts; the next manual start still works.
          }
        }, 150)
        return
      }
      setListening(false)
      clearTimer()
      finishTranscript()
    }
    recognizer.onerror = (event) => {
      if (event.error === 'no-speech' && keepListeningRef.current) return
      keepListeningRef.current = false
      stoppingRef.current = true
      setError(event.error || 'Voice recognition failed.')
    }
    recognizer.onresult = (event) => {
      let interim = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index]?.[0]?.transcript || ''
        if (event.results[index].isFinal) transcriptRef.current = `${transcriptRef.current} ${text}`.trim()
        else interim = `${interim} ${text}`.trim()
      }
      interimRef.current = interim
    }
    recognizerRef.current = recognizer
    recognizer.start()

    autoStopRef.current = window.setTimeout(() => {
      keepListeningRef.current = false
      stoppingRef.current = true
      recognizer.stop()
    }, MAX_LISTEN_MS)
  }, [Recognition, clearTimer, finishTranscript, setError, setListening])

  const stopListening = useCallback(() => {
    keepListeningRef.current = false
    stoppingRef.current = true
    clearTimer()
    try {
      recognizerRef.current?.stop()
    } catch {
      setListening(false)
      finishTranscript()
    }
  }, [clearTimer, finishTranscript, setListening])

  return { startListening, stopListening, supported: Boolean(Recognition) }
}
