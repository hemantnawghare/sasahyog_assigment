import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({ role: { type: String, enum: ['user', 'assistant'], required: true }, content: { type: String, required: true }, createdAt: { type: Date, default: Date.now } }, { _id: false })

const intakeSessionSchema = new mongoose.Schema({ sessionId: { type: String, required: true, unique: true }, language: String, messages: [messageSchema], report: mongoose.Schema.Types.Mixed, endedAt: Date }, { timestamps: true })

export const IntakeSession = mongoose.model('IntakeSession', intakeSessionSchema)
