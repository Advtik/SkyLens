export function speak(text, rate = 1.05, pitch = 1) {
  if (!window.speechSynthesis || !text) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate
  utterance.pitch = pitch
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find((voice) => voice.lang?.startsWith('en') && /Google|Microsoft|Samantha|Natural/i.test(voice.name))
  if (preferred) utterance.voice = preferred
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel()
}

