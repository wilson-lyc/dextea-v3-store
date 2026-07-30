import type { Store } from '@/store/domain/aggregates/store.js'

export interface StoreRepositoryPort {
  findById(id: number): Promise<Store | null>
  findByAccount(account: string): Promise<Store | null>
}
