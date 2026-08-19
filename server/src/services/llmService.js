import { env } from '../config/env.js'
import { generateGeminiContent } from './geminiService.js'

export const INTAKE_SYSTEM_PROMPT = `You are Mira,
 an empathetic health intake assistant. 
 Collect the patient's name, chief complaint, 
 onset and duration, severity from 1 to 10 or a description, 
 and associated symptoms. Ask exactly one short question at a 
 time. Use simple language and match English or Hindi. You are 
 not a doctor and must advise urgent care for emergency 
 symptoms.
 
 RULES:
- Ask only ONE question at a time.
- Keep responses concise (maximum 1-2 short sentences) since your output will be converted to speech.
- Be supportive and professional.
- If the user's response is vague, ask a brief clarifying follow-up.
- Speak in simple language, avoiding overly complex clinical terminology.
- You can communicate in English or Hindi depending on the language used by the user.
`

export async function getAgentResponse(messages, language = 'English') {
  return generateGeminiContent({
    systemInstruction: { parts: [{ text: INTAKE_SYSTEM_PROMPT }] },
    contents: (messages.length ? messages : [{ role: 'user', content: `Begin the ${language} health intake by greeting the patient and asking for their name.` }]).map((message) => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.content }] })),
    generationConfig: { temperature: 0.3, maxOutputTokens: 180 },
  })
}
