import { randomUUID } from 'node:crypto'
import { redis } from './index.js'
import { logger } from '@/shared/utils/logger.js'

const UNLOCK_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`

const RENEW_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("pexpire", KEYS[1], ARGV[2])
else
  return 0
end
`

export interface AcquireOptions {
  ttlMs: number
  renewIntervalMs?: number
}

export interface LockHandle {
  key: string
  token: string
  release: () => Promise<void>
}

const DEFAULT_TTL_MS = 30_000
const DEFAULT_RENEW_INTERVAL_MS = 10_000

export async function tryAcquireLock(
  key: string,
  options: AcquireOptions = { ttlMs: DEFAULT_TTL_MS },
): Promise<LockHandle | null> {
  const token = randomUUID()
  const ttlMs = options.ttlMs > 0 ? options.ttlMs : DEFAULT_TTL_MS
  const renewIntervalMs =
    options.renewIntervalMs && options.renewIntervalMs > 0
      ? options.renewIntervalMs
      : Math.min(DEFAULT_RENEW_INTERVAL_MS, Math.floor(ttlMs / 3))

  const acquired = await redis.set(key, token, 'PX', ttlMs, 'NX')
  if (acquired !== 'OK') {
    return null
  }

  let released = false
  let renewTimer: NodeJS.Timeout | null = null

  const clearRenewTimer = (): void => {
    if (renewTimer !== null) {
      clearInterval(renewTimer)
      renewTimer = null
    }
  }

  const release = async (): Promise<void> => {
    if (released) {
      return
    }
    released = true
    clearRenewTimer()
    try {
      await redis.eval(UNLOCK_SCRIPT, 1, key, token)
    } catch (error) {
      logger.error(`[distributed-lock] 释放锁失败 key=${key}`, error)
    }
  }

  renewTimer = setInterval(async () => {
    if (released) {
      return
    }
    try {
      const renewed = await redis.eval(RENEW_SCRIPT, 1, key, token, ttlMs)
      if (renewed === 0) {
        logger.warn(`[distributed-lock] 续期失败，锁可能已失效 key=${key}`)
      }
    } catch (error) {
      logger.error(`[distributed-lock] 续期异常 key=${key}`, error)
    }
  }, renewIntervalMs)
  renewTimer.unref?.()

  return { key, token, release }
}

export async function withLock<T>(
  key: string,
  onAcquired: () => Promise<T>,
  options: AcquireOptions = { ttlMs: DEFAULT_TTL_MS },
): Promise<T | null> {
  const handle = await tryAcquireLock(key, options)
  if (handle === null) {
    return null
  }
  try {
    return await onAcquired()
  } finally {
    await handle.release()
  }
}
