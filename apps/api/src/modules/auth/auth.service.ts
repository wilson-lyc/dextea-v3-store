import type { LoginRequest } from '@dextea/constraints'
import type { Store } from '@/modules/store/store.model.js'
import type { StoreCredentialsService } from './store-credentials.service.js'
import type { TokenService } from './token.service.js'

export interface AuthenticatedStore {
  store: Store
  token: string
}

export interface AuthService {
  login(input: LoginRequest): Promise<AuthenticatedStore>
}

export class StoreCredentialsAuthService implements AuthService {
  public constructor(
    private readonly credentialsService: StoreCredentialsService,
    private readonly tokenService: TokenService
  ) {}

  public async login(input: LoginRequest): Promise<AuthenticatedStore> {
    const store: Store = await this.credentialsService.authenticate(input)

    const { token } = this.tokenService.generateToken({ storeId: store.id })

    return { store, token }
  }
}
