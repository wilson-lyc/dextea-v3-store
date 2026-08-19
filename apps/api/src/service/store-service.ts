import { BizError } from '@/shared/errors/biz-error.js'
import { logger } from '@/shared/utils/logger.js'
import { StoreErrorCode } from '@/error/store-error.js'
import { verifyPassword, hashPassword } from '@/shared/security/password.js'
import type { StoreRepository } from '@/repository/store-repository.js'
import { storeStatusCode, type StoreStatusCode } from '@dextea/constraints'
import { toStoreView, type StoreView } from '@/mapper/store-mapper.js'
import type { ResetPasswordRequest, UpdateStoreStatusRequest } from '@dextea/constraints'

export class StoreService {
  public constructor(private readonly storeRepository: StoreRepository) {}

  public async getById(id: number): Promise<StoreView> {
    const store = await this.storeRepository.findById(id)
    if (!store) {
      throw new BizError(StoreErrorCode.STORE_NOT_FOUND)
    }
    return toStoreView(store)
  }

  public async updateStatus(id: number, input: UpdateStoreStatusRequest): Promise<void> {
    const allowed: StoreStatusCode[] = [storeStatusCode.CLOSED, storeStatusCode.OPEN]
    if (!allowed.includes(input.status as StoreStatusCode)) {
      throw new BizError(StoreErrorCode.INVALID_STORE_STATUS)
    }

    const store = await this.storeRepository.findById(id)
    if (!store) {
      throw new BizError(StoreErrorCode.STORE_NOT_FOUND)
    }

    await this.storeRepository.updateStatus(id, input.status)
    logger.info(`门店 ${id} 状态已更新为 ${input.status}`)
  }

  public async resetPassword(id: number, input: ResetPasswordRequest): Promise<void> {
    const store = await this.storeRepository.findById(id)
    if (!store) {
      throw new BizError(StoreErrorCode.STORE_NOT_FOUND)
    }

    let passwordMatches: boolean
    try {
      passwordMatches = await verifyPassword(input.oldPassword, store.password)
    } catch (error) {
      logger.error('argon2 校验门店密码时发生系统异常', error)
      throw new BizError(StoreErrorCode.OLD_PASSWORD_INCORRECT)
    }

    if (!passwordMatches) {
      throw new BizError(StoreErrorCode.OLD_PASSWORD_INCORRECT)
    }

    if (input.oldPassword === input.newPassword) {
      throw new BizError(StoreErrorCode.SAME_AS_OLD_PASSWORD)
    }

    const newHash = await hashPassword(input.newPassword)
    await this.storeRepository.updatePassword(id, newHash)
    logger.info(`门店 ${id} 密码已重置`)
  }
}
