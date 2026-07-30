import { Redis } from 'ioredis'
import { config } from '@/shared/config.js'

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
  console.error('[redis] connection error:', err.message)
})

redis.on('connect', () => {
  console.info('[redis] connected')
})

export { Redis }
