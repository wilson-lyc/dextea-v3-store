import { tryAcquireLock } from '@/shared/infrastructure/redis/distributed-lock.js'

export interface AcquireLockOptions {
  ttlMs: number
  renewIntervalMs?: number
}

export interface LockHandle {
  release(): Promise<void>
}

export interface DistributedLock {
  tryAcquire(key: string, options?: AcquireLockOptions): Promise<LockHandle | null>
}

export class RedisDistributedLock implements DistributedLock {
  async tryAcquire(
    key: string,
    options: AcquireLockOptions = { ttlMs: 30_000 },
  ): Promise<LockHandle | null> {
    const handle = await tryAcquireLock(key, options)
    if (handle === null) {
      return null
    }
    return { release: handle.release }
  }
}

export const redisDistributedLock = new RedisDistributedLock()
