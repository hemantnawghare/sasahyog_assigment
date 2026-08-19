import http from 'node:http'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { env } from './config/env.js'
import { setupCallWebSocket } from './websocket/callHandler.js'

const app = express()
app.use(cors({ origin: env.clientOrigin }))
app.use(express.json())
app.get('/health', (_request, response) => response.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'offline' }))
const server = http.createServer(app)
setupCallWebSocket(server)

if (env.mongoUri) mongoose.connect(env.mongoUri).then(() => console.log('MongoDB connected')).catch((error) => console.error('MongoDB connection failed:', error.message))
server.listen(env.port, () => console.log(`Sasahyog server listening on http://localhost:${env.port}`))
