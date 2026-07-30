import { LoginUseCase } from '@/store/application/use-cases/login-use-case.js'
import { GetStoreUseCase } from '@/store/application/use-cases/get-store-use-case.js'
import { storeRepository } from '@/store/infrastructure/repositories/store-repository.js'
import { jwtService } from '@/store/infrastructure/jwt/jwt-service.js'

export const loginUseCase = new LoginUseCase(storeRepository, jwtService)
export const getStoreUseCase = new GetStoreUseCase(storeRepository)
