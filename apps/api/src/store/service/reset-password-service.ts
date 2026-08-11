import { BizError } from '@/shared/errors/biz-error.js'
import { logger } from '@/shared/utils/logger.js'
import { verifyPassword, hashPassword } from '@/shared/infrastructure/security/password.js'
import { StoreErrorCode } from '@/store/error.js'
import type { StoreRepository } from '@/store/repository/store-repository.js'
import type { ResetPasswordRequest } from '@dextea/constraints'

export class ResetPasswordService {
  constructor(private readonly storeRepository: StoreRepository) {}

  async execute(id: number, input: ResetPasswordRequest): Promise<void> {
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
