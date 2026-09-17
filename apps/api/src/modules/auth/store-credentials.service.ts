import type { LoginRequest, ResetPasswordRequest } from '@dextea/constraints'
import { BizError } from '@/shared/errors.js'
import { getLogger } from '@/shared/logger.js'
import { hashPassword, verifyPassword } from '@/infrastructure/security/password.js'
import type { Store } from '@/modules/store/store.model.js'
import type { StoreRepository } from '@/modules/store/store.repository.js'
import { authErrors } from './auth.error.js'
import { storeErrors } from '@/modules/store/store.error.js'

export interface StoreCredentialsService {
  authenticate(input: LoginRequest): Promise<Store>
  changePassword(id: number, input: ResetPasswordRequest): Promise<void>
}

export class LocalStoreCredentialsService implements StoreCredentialsService {
  private readonly logger = getLogger()

  public constructor(private readonly storeRepository: StoreRepository) {}

  public async authenticate(input: LoginRequest): Promise<Store> {
    const store = await this.storeRepository.findByAccount(input.account)
    if (!store || !(await this.passwordMatches(input.password, store.password))) {
      throw new BizError(authErrors.INVALID_CREDENTIALS)
    }
    if (!store.isAvailable()) {
      throw new BizError(authErrors.STORE_DISABLED)
    }
    return store
  }

  public async changePassword(id: number, input: ResetPasswordRequest): Promise<void> {
    const store = await this.storeRepository.findById(id)
    if (!store) throw new BizError(storeErrors.STORE_NOT_FOUND)
    if (!(await this.passwordMatches(input.oldPassword, store.password))) {
      throw new BizError(storeErrors.OLD_PASSWORD_INCORRECT)
    }
    if (input.oldPassword === input.newPassword) {
      throw new BizError(storeErrors.SAME_AS_OLD_PASSWORD)
    }
    const updated = await this.storeRepository.updatePassword(
      id,
      await hashPassword(input.newPassword)
    )
    if (!updated) throw new BizError(storeErrors.STORE_NOT_FOUND)
    this.logger.info({ storeId: id }, '[auth] 门店密码已修改')
  }

  private async passwordMatches(plaintext: string, storedHash: string): Promise<boolean> {
    try {
      return await verifyPassword(plaintext, storedHash)
    } catch (error) {
      this.logger.error({ error }, '[auth] 校验门店密码时发生系统异常')
      return false
    }
  }
}
