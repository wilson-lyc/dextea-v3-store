import type { ResetPasswordRequest, StoreStatusCode } from '@dextea/constraints'
import type { Store } from './store.model.js'

/** 门店领域的应用端口，具体实现由 store-service RPC 客户端提供。 */
export interface StoreService {
  getById(id: number): Promise<Store>
  updateStatus(id: number, status: StoreStatusCode): Promise<void>
  resetPassword(id: number, input: ResetPasswordRequest): Promise<void>
}
