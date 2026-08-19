# Sasahyog

Sasahyog is a voice-first health intake workspace. The React client uses browser speech recognition for microphone input and browser speech synthesis for spoken replies; the Express/WebSocket server orchestrates Gemini, generates a structured report, and stores completed sessions in MongoDB.

## Run locally

Prerequisites: Node.js 18 or 20 LTS, npm, and optionally MongoDB.

```powershell
npm run install:all
Copy-Item server/.env.example server/.env
npm run dev:server
# in a second terminal
npm run dev --prefix client
```

Open `http://localhost:5173`. Add a Gemini key before starting the server. Click `Start voice intake`, allow microphone access, and speak when the status says `Listening`. Chrome and Edge provide the most reliable `SpeechRecognition` support. The text composer remains available as an accessibility fallback.

## Provider configuration

Add `GEMINI_API_KEY` in `server/.env` for conversational replies and structured report extraction. `MONGODB_URI` enables persistence; without MongoDB, the server still serves the live conversation but cannot persist completed sessions. Voice input/output is handled by browser APIs, so no separate STT/TTS provider key is needed.

## Event contract

Client messages: `START_CALL`, binary audio chunks, `USER_TRANSCRIPT`, `END_CALL`.

Server messages: `STATUS`, `TRANSCRIPT_UPDATE`, `AGENT_TEXT`, `FINAL_REPORT`, `ERROR`.

The report includes patient name, chief complaint, duration, severity, associated symptoms, summary, and follow-up flags. Short calls are marked `INCOMPLETE` rather than failing.
