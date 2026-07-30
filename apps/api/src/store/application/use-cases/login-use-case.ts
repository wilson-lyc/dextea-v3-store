import { BizError } from '@/shared/errors/biz-error.js'
import { logger } from '@/shared/utils/logger.js'
import { verifyPassword } from '@/shared/infrastructure/security/password.js'
import { StoreErrorCode } from '@/store/domain/errors.js'
import type { StoreRepositoryPort } from '@/store/domain/repositories/store-repository-port.js'
import type { TokenProvider } from '@/store/domain/ports/token-provider.js'
import type { LoginRequest, LoginResponse } from '@dextea/constraints'

export class LoginUseCase {
  constructor(
    private readonly storeRepository: StoreRepositoryPort,
    private readonly tokenProvider: TokenProvider,
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

    const { token } = this.tokenProvider.generateToken({
      storeId: String(store.id),
    })

    return {
      storeId: String(store.id),
      token,
    }
  }
}
