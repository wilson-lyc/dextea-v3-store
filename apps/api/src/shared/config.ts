import process from 'node:process'

interface DatabaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
}

interface RedisConfig {
  host: string
  port: number
  password: string
  db: number
}

interface JwtConfig {
  secret: string
  expiresIn: string
}

interface AppConfig {
  env: string
  database: DatabaseConfig
  redis: RedisConfig
  jwt: JwtConfig
}

const REQUIRED_VARS = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_SECRET',
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
    throw new Error(`Invalid port value: ${raw}`)
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

function loadRedisConfig(): RedisConfig {
  const rawDb = process.env.REDIS_DB?.trim()
  const db = rawDb === undefined || rawDb === '' ? 0 : Number(rawDb)
  if (!Number.isInteger(db) || db < 0) {
    throw new Error(`Invalid REDIS_DB: ${rawDb}`)
  }
  return {
    host: readRaw('REDIS_HOST'),
    port: parsePort(readRaw('REDIS_PORT')),
    password: process.env.REDIS_PASSWORD?.trim() ?? '',
    db,
  }
}

function loadJwtConfig(): JwtConfig {
  return {
    secret: readRaw('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN?.trim() || '7d',
  }
}

function loadConfig(): AppConfig {
  return {
    env: process.env.NODE_ENV?.trim() || 'development',
    database: loadDatabaseConfig(),
    redis: loadRedisConfig(),
    jwt: loadJwtConfig(),
  }
}

export const config: AppConfig = loadConfig()
