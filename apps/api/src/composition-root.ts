import { LoginUseCase } from '@/auth/application/use-cases/login-use-case.js'
import { storeCredentialRepository } from '@/store/infrastructure/repositories/store-credential-repository.js'
import { jwtService } from '@/auth/infrastructure/jwt/jwt-service.js'
import { storeRepository } from '@/store/infrastructure/repositories/store-repository.js'
import { GetStoreUseCase } from '@/store/application/use-cases/get-store-use-case.js'

export const loginUseCase = new LoginUseCase(storeCredentialRepository, jwtService)
export const getStoreUseCase = new GetStoreUseCase(storeRepository)
