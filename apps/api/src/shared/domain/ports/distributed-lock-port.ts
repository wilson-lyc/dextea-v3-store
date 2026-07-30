export interface AcquireLockOptions {
  ttlMs: number
  renewIntervalMs?: number
}

export interface LockHandle {
  release(): Promise<void>
}

export interface DistributedLockPort {
  tryAcquire(key: string, options?: AcquireLockOptions): Promise<LockHandle | null>
}
