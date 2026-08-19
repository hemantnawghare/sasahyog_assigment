import dotenv from 'dotenv'

const fileEnv = dotenv.config().parsed || {}
const configuredOrigins = (process.env.CLIENT_ORIGINS || fileEnv.CLIENT_ORIGINS || '').split(',')
const legacyOrigin = process.env.CLIENT_ORIGIN || fileEnv.CLIENT_ORIGIN || ''

export const env = {
  port: Number(process.env.PORT || fileEnv.PORT || 4000),
  clientOrigins: [...configuredOrigins, legacyOrigin, 'http://localhost:5173', 'https://hemantnawghare-sasahyogassigment.vercel.app'].map((origin) => origin.trim()).filter(Boolean).filter((origin, index, origins) => origins.indexOf(origin) === index),
  mongoUri: process.env.MONGODB_URI || fileEnv.MONGODB_URI || '',
  geminiKey: process.env.GEMINI_API_KEY || fileEnv.GEMINI_API_KEY || '',
  geminiModel: fileEnv.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
}
