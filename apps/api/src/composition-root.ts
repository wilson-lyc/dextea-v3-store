import { LoginUseCase } from '@/auth/application/use-cases/login-use-case.js'
import { storeRepository } from '@/store/infrastructure/repositories/store-repository.js'
import { jwtService } from '@/auth/infrastructure/jwt/jwt-service.js'

export const loginUseCase = new LoginUseCase(storeRepository, jwtService)
