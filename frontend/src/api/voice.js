const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const INTENT_PATTERNS = [
  { pattern: /(?:weather|forecast|temperature|humidity|pressure|wind|aqi|uv|rain)\s+(?:in|for|at|of)\s+([a-zA-Z .'-]+)/i, type: 'weather', cityGroup: 1 },
  { pattern: /weather (in|for|at) (.+)/i, type: 'weather', cityGroup: 2 },
  { pattern: /forecast (for|in)? ?(.+)/i, type: 'forecast', cityGroup: 2 },
  { pattern: /(?:safe|risky|dangerous).*(?:in|for|at)\s+([a-zA-Z .'-]+)/i, type: 'advisory', cityGroup: 1 },
  { pattern: /(school|college|university|attendance|safe|risky)/i, type: 'advisory' },
  { pattern: /(?:disaster|flood|storm|heatwave|cyclone|warning|alert).*(?:in|for|at)\s+([a-zA-Z .'-]+)/i, type: 'disaster', cityGroup: 1 },
  { pattern: /(disaster|flood|storm|heatwave|cyclone|warning|alert)/i, type: 'disaster' },
  { pattern: /switch to (.+)/i, type: 'navigate', cityGroup: 1 },
  { pattern: /go to (.+)/i, type: 'navigate', cityGroup: 1 },
  { pattern: /humidity|pressure|wind|aqi|uv|temperature/i, type: 'weather' },
]

export function detectIntent(query) {
  for (const { pattern, type, cityGroup } of INTENT_PATTERNS) {
    const match = query.match(pattern)
    if (match) {
      const city = cityGroup ? cleanCity(match[cityGroup]) : null
      return { type, city, confidence: 'local' }
    }
  }
  return { type: 'general', city: null, confidence: 'low' }
}

function cleanCity(value) {
  if (!value) return null
  return value
    .replace(/\b(today|tomorrow|now|please|this week|next week|weather|forecast|temperature)\b/gi, '')
    .replace(/[?.!,]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export const fetchVoiceResponse = async ({ query, city, includeAdvisory = false, includeDisaster = false }) => {
  const res = await fetch(`${BASE_URL}/api/groq/voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, city, include_advisory: includeAdvisory, include_disaster: includeDisaster }),
  })
  if (!res.ok) throw new Error(`Voice service error: ${res.status}`)
  return res.json()
}
