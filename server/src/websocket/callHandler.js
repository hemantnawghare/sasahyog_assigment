import { randomUUID } from 'node:crypto'
import { WebSocketServer } from 'ws'
import { IntakeSession } from '../models/IntakeSession.js'
import { getAgentResponse } from '../services/llmService.js'
import { generateHealthReport } from '../services/reportService.js'

export function setupCallWebSocket(server) {
  const wss = new WebSocketServer({ server })
  wss.on('connection', (ws) => {
    const session = { id: randomUUID(), language: 'English', messages: [], processing: false }
    const send = (payload) => ws.readyState === ws.OPEN && ws.send(JSON.stringify(payload))
    ws.on('message', async (data, isBinary) => {
      try {
        if (isBinary) return
        const payload = JSON.parse(data.toString())
        if (payload.event === 'START_CALL') {
          session.language = payload.language || 'English'
          send({ event: 'STATUS', data: 'CONNECTED', sessionId: session.id })
          const opening = await getAgentResponse([], session.language)
          session.messages.push({ role: 'assistant', content: opening })
          send({ event: 'AGENT_TEXT', text: opening })
          return
        }
        if (payload.event === 'USER_TRANSCRIPT' && !session.processing) {
          session.processing = true
          session.messages.push({ role: 'user', content: payload.text })
          send({ event: 'TRANSCRIPT_UPDATE', role: 'user', text: payload.text })
          const text = await getAgentResponse(session.messages, session.language)
          session.messages.push({ role: 'assistant', content: text })
          send({ event: 'AGENT_TEXT', text })
          session.processing = false
          return
        }
        if (payload.event === 'END_CALL') {
          const report = await generateHealthReport(session.messages)
          await IntakeSession.findOneAndUpdate({ sessionId: session.id }, { sessionId: session.id, language: session.language, messages: session.messages, report, endedAt: new Date() }, { upsert: true, new: true }).catch(() => null)
          send({ event: 'FINAL_REPORT', report })
        }
      } catch (error) {
        session.processing = false
        console.error('WebSocket message error:', error)
        send({ event: 'ERROR', message: error.message || 'Unable to process that response.' })
      }
    })
  })
  return wss
}
