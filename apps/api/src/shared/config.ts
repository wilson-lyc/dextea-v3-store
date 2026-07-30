import process from 'node:process'

interface DatabaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
}

interface AppConfig {
  env: string
  database: DatabaseConfig
}

const REQUIRED_VARS = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
] as const

type RequiredVar = (typeof REQUIRED_VARS)[number]

function readRaw(key: RequiredVar): string {
  const value = process.env[key]
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value.trim()
}

function parsePort(raw: string): number {
  const port = Number(raw)
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid DB_PORT: ${raw}`)
  }
  return port
}

function loadDatabaseConfig(): DatabaseConfig {
  return {
    host: readRaw('DB_HOST'),
    port: parsePort(readRaw('DB_PORT')),
    database: readRaw('DB_NAME'),
    user: readRaw('DB_USER'),
    password: readRaw('DB_PASSWORD'),
  }
}

function loadConfig(): AppConfig {
  return {
    env: process.env.NODE_ENV?.trim() || 'development',
    database: loadDatabaseConfig(),
  }
}

export const config: AppConfig = loadConfig()
