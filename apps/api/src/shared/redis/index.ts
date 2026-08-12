import { Redis } from 'ioredis'
import { config } from '@/config.js'
import { logger } from '@/shared/utils/logger.js'

const { host, port, password, db } = config.redis

export const redis = new Redis({
  host,
  port,
  password: password === '' ? undefined : password,
  db,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
})

redis.on('error', (err: Error) => {
  logger.error('[redis] connection error:', err.message)
})

redis.on('connect', () => {
  logger.info('[redis] connected')
})

export { Redis }
