import { BizError } from '@/shared/errors/biz-error.js'
import { logger } from '@/shared/utils/logger.js'
import { verifyPassword } from '@/shared/infrastructure/security/password.js'
import { StoreErrorCode } from '@/store/error.js'
import { storeRepository } from '@/store/repository/store-repository.js'
import { jwtService } from '@/store/service/jwt-service.js'
import type { LoginRequest, LoginResponse } from '@dextea/constraints'

export class LoginService {
  async execute(input: LoginRequest): Promise<LoginResponse> {
    const store = await storeRepository.findByAccount(input.account)
    if (!store) {
      throw new BizError(StoreErrorCode.INVALID_CREDENTIALS)
    }

    let passwordMatches: boolean
    try {
      passwordMatches = await verifyPassword(input.password, store.password)
    } catch (error) {
      logger.error('argon2 校验门店密码时发生系统异常', error)
      throw new BizError(StoreErrorCode.INVALID_CREDENTIALS)
    }

    if (!passwordMatches) {
      throw new BizError(StoreErrorCode.INVALID_CREDENTIALS)
    }

    if (!store.isAvailable()) {
      throw new BizError(StoreErrorCode.STORE_DISABLED)
    }

    const { token } = jwtService.generateToken({
      storeId: String(store.id),
    })

    return {
      storeId: String(store.id),
      token,
    }
  }
}

export const loginService = new LoginService()
