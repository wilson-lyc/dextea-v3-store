import type { LoginRequest } from '@dextea/constraints'
import { BizError } from '@/shared/errors.js'
import { getLogger } from '@/shared/logger.js'
import { verifyPassword } from '@/infrastructure/security/password.js'
import { authErrors } from './auth.error.js'
import type { Store } from '@/modules/store/store.model.js'
import type { StoreRepository } from '@/modules/store/store.repository.js'
import type { TokenService } from './token.service.js'

export interface AuthenticatedStore {
  store: Store
  token: string
}

export interface AuthService {
  login(input: LoginRequest): Promise<AuthenticatedStore>
}

export class StoreCredentialsAuthService implements AuthService {
  private readonly logger = getLogger()

  public constructor(
    private readonly storeRepository: StoreRepository,
    private readonly tokenService: TokenService,
  ) {}

  public async login(input: LoginRequest): Promise<AuthenticatedStore> {
    const store = await this.storeRepository.findByAccount(input.account)

    if (!store || !(await this.passwordMatches(input.password, store.password))) {
      throw new BizError(authErrors.INVALID_CREDENTIALS)
    }

    if (!store.isAvailable()) {
      throw new BizError(authErrors.STORE_DISABLED)
    }

    const { token } = this.tokenService.generateToken({ storeId: store.id })

    this.logger.info({ storeId: store.id }, '[auth] 门店登录成功')

    return { store, token }
  }

  private async passwordMatches(plaintextPassword: string, storedHash: string): Promise<boolean> {
    try {
      return await verifyPassword(plaintextPassword, storedHash)
    } catch (error) {
      this.logger.error({ error }, '[auth] 校验门店密码时发生系统异常')
      return false
    }
  }
}
