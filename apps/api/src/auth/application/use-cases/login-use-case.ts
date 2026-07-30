import { BizError } from '@/shared/errors/biz-error.js'
import { logger } from '@/shared/utils/logger.js'
import { verifyPassword } from '@/shared/infrastructure/security/password.js'
import { AuthErrorCode } from '@/auth/domain/errors.js'
import type { AuthStorePort } from '@/auth/domain/ports/auth-store-port.js'
import type { TokenProvider } from '@/auth/domain/ports/token-provider.js'
import type { LoginRequest, LoginResponse } from '@dextea/constraints'

export class LoginUseCase {
  constructor(
    private readonly storePort: AuthStorePort,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async execute(input: LoginRequest): Promise<LoginResponse> {
    const store = await this.storePort.findByAccount(input.account)
    if (!store) {
      throw new BizError(AuthErrorCode.INVALID_CREDENTIALS)
    }

    let passwordMatches: boolean
    try {
      passwordMatches = await verifyPassword(input.password, store.password)
    } catch (error) {
      logger.error('argon2 校验门店密码时发生系统异常', error)
      throw new BizError(AuthErrorCode.INVALID_CREDENTIALS)
    }

    if (!passwordMatches) {
      throw new BizError(AuthErrorCode.INVALID_CREDENTIALS)
    }
    if (store.status !== 1) {
      throw new BizError(AuthErrorCode.STORE_DISABLED)
    }

    const { token, expiresIn } = this.tokenProvider.generateToken({
      userId: String(store.id),
      account: store.account,
    })

    return {
      storeId: String(store.id),
      token,
      expiresIn,
    }
  }
}
