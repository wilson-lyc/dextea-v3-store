import { StoreStatus, type ResetPasswordRequest, type StoreStatusCode } from '@dextea/constraints'
import { BizError } from '@/shared/errors.js'
import { getLogger } from '@/shared/logger.js'
import { hashPassword, verifyPassword } from '@/infrastructure/security/password.js'
import { storeErrors } from './store.error.js'
import type { Store } from './store.model.js'
import type { StoreRepository } from './store.repository.js'

const UPDATABLE_STATUSES: readonly StoreStatusCode[] = [
  StoreStatus.keyMap.CLOSED,
  StoreStatus.keyMap.OPEN,
]

export class StoreService {
  private readonly logger = getLogger()

  public constructor(private readonly storeRepository: StoreRepository) {}

  public async getById(id: number): Promise<Store> {
    const store = await this.storeRepository.findById(id)

    if (!store) {
      throw new BizError(storeErrors.STORE_NOT_FOUND)
    }

    return store
  }

  public async updateStatus(id: number, status: StoreStatusCode): Promise<void> {
    if (!UPDATABLE_STATUSES.includes(status)) {
      throw new BizError(storeErrors.INVALID_STORE_STATUS)
    }

    const updated = await this.storeRepository.updateStatus(id, status)

    if (!updated) {
      throw new BizError(storeErrors.STORE_NOT_FOUND)
    }

    this.logger.info({ storeId: id, status }, '[store] 门店状态已更新')
  }

  public async resetPassword(id: number, input: ResetPasswordRequest): Promise<void> {
    const store = await this.getById(id)

    if (!(await verifyPassword(input.oldPassword, store.password))) {
      throw new BizError(storeErrors.OLD_PASSWORD_INCORRECT)
    }

    if (input.oldPassword === input.newPassword) {
      throw new BizError(storeErrors.SAME_AS_OLD_PASSWORD)
    }

    const passwordHash = await hashPassword(input.newPassword)
    const updated = await this.storeRepository.updatePassword(id, passwordHash)

    if (!updated) {
      throw new BizError(storeErrors.STORE_NOT_FOUND)
    }

    this.logger.info({ storeId: id }, '[store] 门店密码已重置')
  }
}
