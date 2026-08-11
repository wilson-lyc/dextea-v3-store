import { LoginService } from '@/store/service/login-service.js'
import { GetStoreService } from '@/store/service/get-store-service.js'
import { UpdateStoreStatusService } from '@/store/service/update-store-status-service.js'
import { ResetPasswordService } from '@/store/service/reset-password-service.js'
import { storeRepository } from '@/store/repository/store-repository.js'
import { jwtService } from '@/store/service/jwt-service.js'
import { redisDistributedLock } from '@/shared/infrastructure/redis/redis-distributed-lock-adapter.js'
import { ListActiveProductsService } from '@/product/service/list-active-products-service.js'
import { productRepository } from '@/product/repository/product-repository.js'

export const loginService = new LoginService(storeRepository, jwtService)
export const getStoreService = new GetStoreService(storeRepository)
export const updateStoreStatusService = new UpdateStoreStatusService(
  storeRepository,
  redisDistributedLock,
)
export const resetPasswordService = new ResetPasswordService(storeRepository)
export const listActiveProductsService = new ListActiveProductsService(productRepository)
