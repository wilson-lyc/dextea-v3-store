import { BizError } from '@/shared/errors/biz-error.js'
import { logger } from '@/shared/utils/logger.js'
import { verifyPassword } from '@/shared/infrastructure/security/password.js'
import { StoreErrorCode } from '@/store/error.js'
import type { StoreRepository } from '@/store/repository/store-repository.js'
import type { TokenService } from '@/store/service/token-service.js'
import type { LoginRequest, LoginResponse } from '@dextea/constraints'

export class LoginService {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: LoginRequest): Promise<LoginResponse> {
    const store = await this.storeRepository.findByAccount(input.account)
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

    const { token } = this.tokenService.generateToken({
      storeId: String(store.id),
    })

    return {
      storeId: String(store.id),
      token,
    }
  }
}
