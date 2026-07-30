import type { Store } from '@/store/domain/aggregates/store.js'

export interface StoreRepositoryPort {
  findById(id: number): Promise<Store | null>
  findByAccount(account: string): Promise<Store | null>
  updateStatus(id: number, status: number): Promise<void>
  updatePassword(id: number, passwordHash: string): Promise<void>
}
