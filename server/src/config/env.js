import dotenv from 'dotenv'

const fileEnv = dotenv.config().parsed || {}

export const env = {
  port: Number(process.env.PORT || fileEnv.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || fileEnv.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || fileEnv.MONGODB_URI || '',
  geminiKey: process.env.GEMINI_API_KEY || fileEnv.GEMINI_API_KEY || '',
  geminiModel: fileEnv.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
}
