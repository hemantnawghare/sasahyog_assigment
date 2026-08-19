import { useEffect, useRef, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const initialMessages = [
  { role: 'assistant', text: 'Hello, I am Mira. I will guide you through a short health intake.' },
  { role: 'assistant', text: 'What is your name?' },
]

function App() {
  const [status, setStatus] = useState('Ready')
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [report, setReport] = useState(null)
  const [language, setLanguage] = useState('English')
  const socketRef = useRef(null)
  const recognitionRef = useRef(null)
  const callActiveRef = useRef(false)

  useEffect(() => () => { callActiveRef.current = false; recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); socketRef.current?.close() }, [])
  function addMessage(role, text) { setMessages((current) => [...current, { role, text }]) }
  function connect() {
    if (socketRef.current?.readyState === WebSocket.OPEN) return Promise.resolve(socketRef.current)
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(API_URL.replace(/^http/, 'ws'))
      socketRef.current = socket
      socket.onopen = () => { socket.send(JSON.stringify({ event: 'START_CALL', language })); setStatus('Listening'); resolve(socket) }
      socket.onmessage = ({ data }) => {
      const event = JSON.parse(data)
      if (event.event === 'AGENT_TEXT') {
        addMessage('assistant', event.text)
        window.speechSynthesis?.speak(new SpeechSynthesisUtterance(event.text))
        setStatus(callActiveRef.current ? 'Listening' : 'Ready')
      }
      if (event.event === 'FINAL_REPORT') { setReport(event.report); setStatus('Complete') }
      if (event.event === 'ERROR') { addMessage('assistant', event.message); setStatus('Needs attention') }
    }
      socket.onerror = () => { setStatus('Offline demo'); reject(new Error('WebSocket connection failed')) }
      socket.onclose = () => { if (status !== 'Complete') setStatus('Ready') }
    })
  }
  function startRecognition(socket) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) { setStatus('Browser voice unavailable'); return }
    const recognition = new Recognition()
    recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN'
    recognition.continuous = true
    recognition.interimResults = false
    recognition.onstart = () => setStatus('Listening')
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1]
      if (!result.isFinal || !result[0].transcript.trim()) return
      const text = result[0].transcript.trim()
      addMessage('user', text)
      setStatus('Thinking')
      socket.send(JSON.stringify({ event: 'USER_TRANSCRIPT', text, language }))
    }
    recognition.onerror = (event) => { if (event.error !== 'aborted') setStatus(`Voice error: ${event.error}`) }
    recognition.onend = () => { if (callActiveRef.current) recognition.start() }
    recognitionRef.current = recognition
    recognition.start()
  }
  async function startCall() {
    setReport(null); setMessages(initialMessages); callActiveRef.current = true
    try {
      const socket = await connect()
      startRecognition(socket)
    } catch { callActiveRef.current = false; setStatus('Connection failed') }
  }
  function endCall() {
    callActiveRef.current = false
    recognitionRef.current?.stop()
    window.speechSynthesis?.cancel()
    socketRef.current?.send(JSON.stringify({ event: 'END_CALL' }))
    setStatus('Preparing report')
  }
  function sendMessage(event) {
    event.preventDefault(); const text = draft.trim(); if (!text) return
    addMessage('user', text); setDraft('')
    connect().then((socket) => { setStatus('Thinking'); socket.send(JSON.stringify({ event: 'USER_TRANSCRIPT', text, language })) }).catch(() => setStatus('Offline demo'))
  }
  return (
    <main className="shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">+</span><span>sasahyog</span></div><div className="topbar-meta"><span className="secure-dot" /> Private session <span className="divider" /> <span>Intake workspace</span></div></header>
      <section className="intro"><div><p className="eyebrow">VOICE HEALTH INTAKE <span>01</span></p><h1>A calmer first step<br /><em>toward care.</em></h1><p className="intro-copy">A guided conversation that gathers the details your care team needs, clearly and with empathy.</p></div><div className="session-card"><div className="pulse-ring"><span className="pulse-core" /></div><div><span className="card-label">SESSION STATUS</span><strong>{status}</strong></div><span className="session-time">~ 05 min</span></div></section>
      <section className="workspace"><div className="conversation-panel"><div className="panel-head"><div><span className="card-label">LIVE CONVERSATION</span><h2>Intake with Mira</h2></div><select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Language"><option>English</option><option>Hindi</option></select></div><div className="messages" aria-live="polite">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}><span className="avatar">{message.role === 'assistant' ? 'M' : 'You'}</span><div><span className="message-name">{message.role === 'assistant' ? 'Mira' : 'You'}</span><p>{message.text}</p></div></div>)}{status === 'Thinking' && <div className="thinking">Mira is thinking <span>...</span></div>}</div><form className="composer" onSubmit={sendMessage}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a response or use your voice..." aria-label="Response" /><button className="send-button" type="submit">Send</button></form></div><aside className="control-panel"><div><span className="card-label">SESSION CONTROLS</span><h2>Take your time.</h2><p className="muted">You can pause, answer in your own words, or end the session whenever you are ready.</p></div><div className="waveform" aria-hidden="true">{Array.from({ length: 28 }, (_, index) => <i key={index} style={{ height: `${22 + ((index * 17) % 50)}%` }} />)}</div><div className="control-actions"><button className="start-button" onClick={startCall} disabled={status === 'Listening' || status === 'Thinking'}><span className="mic-icon">●</span> {status === 'Complete' ? 'Start new intake' : 'Start voice intake'}</button><button className="end-button" onClick={endCall} disabled={!socketRef.current || status === 'Complete' || status === 'Preparing report'}>End session</button></div><div className="privacy-note"><span>+</span><p>Your responses are encrypted in transit and used only to prepare your intake summary.</p></div></aside></section>
      {report && <section className="report-panel"><div><span className="card-label">INTAKE SUMMARY</span><h2>Ready for your care team</h2></div><div className="report-grid"><div><span>Patient name</span><strong>{report.patientName}</strong></div><div><span>Primary concern</span><strong>{report.chiefComplaint}</strong></div><div><span>Duration</span><strong>{report.duration}</strong></div><div><span>Severity</span><strong>{report.severity}</strong></div><div className="wide"><span>Associated symptoms</span><strong>{report.associatedSymptoms?.join(', ') || 'None reported'}</strong></div></div><p className="report-summary">{report.summary}</p></section>}
    </main>
  )
}

export default App
