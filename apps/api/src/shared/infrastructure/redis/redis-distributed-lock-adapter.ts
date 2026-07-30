import { tryAcquireLock } from '@/shared/infrastructure/redis/distributed-lock.js'
import type {
  AcquireLockOptions,
  DistributedLockPort,
  LockHandle,
} from '@/shared/domain/ports/distributed-lock-port.js'

export class RedisDistributedLock implements DistributedLockPort {
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
