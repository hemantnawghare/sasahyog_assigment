import { generateGeminiContent } from './geminiService.js'

const incompleteReport = { patientName: 'Not Provided', chiefComplaint: 'Not provided', duration: 'Not provided', severity: 'Not provided', associatedSymptoms: [], summary: 'The call ended before intake information could be collected.', flaggedFollowUp: 'Review with a healthcare professional.' }

export async function generateHealthReport(messages) {
  const userMessages = messages.filter((message) => message.role === 'user')
  if (!userMessages.length) return { ...incompleteReport, status: 'INCOMPLETE' }
  const text = await generateGeminiContent({
    contents: [{ role: 'user', parts: [{ text: `Extract a structured health intake report from this conversation. Return only valid JSON with patientName, chiefComplaint, duration, severity, associatedSymptoms as an array, summary, and flaggedFollowUp.\n\n${JSON.stringify(messages)}` }] }],
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
  })
  return JSON.parse(text)
}
