import type { LoginRequest, ResetPasswordRequest } from '@dextea/constraints'
import type { Store } from '@/modules/store/store.model.js'

export interface StoreCredentialsService {
  authenticate(input: LoginRequest): Promise<Store>
  changePassword(id: number, input: ResetPasswordRequest): Promise<void>
}
