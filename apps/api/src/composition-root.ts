import { LoginUseCase } from '@/store/application/use-cases/login-use-case.js'
import { GetStoreUseCase } from '@/store/application/use-cases/get-store-use-case.js'
import { UpdateStoreStatusUseCase } from '@/store/application/use-cases/update-store-status-use-case.js'
import { ResetPasswordUseCase } from '@/store/application/use-cases/reset-password-use-case.js'
import { storeRepository } from '@/store/infrastructure/repositories/store-repository.js'
import { jwtService } from '@/store/infrastructure/jwt/jwt-service.js'
import { redisDistributedLock } from '@/shared/infrastructure/redis/redis-distributed-lock-adapter.js'

export const loginUseCase = new LoginUseCase(storeRepository, jwtService)
export const getStoreUseCase = new GetStoreUseCase(storeRepository)
export const updateStoreStatusUseCase = new UpdateStoreStatusUseCase(
  storeRepository,
  redisDistributedLock,
)
export const resetPasswordUseCase = new ResetPasswordUseCase(storeRepository)
