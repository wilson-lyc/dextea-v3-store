import pino, { type Logger, type LoggerOptions } from 'pino'
import { getConfig } from '@/config/index.js'

const REDACTED_PATHS = [
  'req.headers.authorization',
  'authorization',
  'password',
  'oldPassword',
  'newPassword',
  'token',
  'secret',
]

export function buildLoggerOptions(level: string): LoggerOptions {
  return {
    level,
    base: { service: 'dextea-store-api' },
    redact: { paths: REDACTED_PATHS, censor: '[redacted]' },
    timestamp: pino.stdTimeFunctions.isoTime,
  }
}

let instance: Logger | undefined

export function getLogger(): Logger {
  if (!instance) {
    instance = pino(buildLoggerOptions(getConfig().log.level))
  }
  return instance
}

export function resetLogger(): void {
  instance = undefined
}

export type { Logger }
