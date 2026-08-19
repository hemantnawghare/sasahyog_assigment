import { env } from '../config/env.js'

export async function generateGeminiContent(requestBody) {
  if (!env.geminiKey) throw new Error('GEMINI_API_KEY is not configured')

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    let message = `Gemini request failed with HTTP ${response.status}`
    try {
      const error = await response.json()
      message = error.error?.message || message
    } catch {
      // Keep the HTTP status when Gemini does not return JSON.
    }
    const retryAfter = response.headers.get('retry-after')
    if (response.status === 429) message = `Gemini quota exceeded. ${message}${retryAfter ? ` Retry after ${retryAfter} seconds.` : ''}`
    throw new Error(message)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned no text response')
  return text
}
