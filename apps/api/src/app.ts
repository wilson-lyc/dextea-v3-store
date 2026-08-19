import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { config } from '@/config.js'
import { db } from '@/shared/database/index.js'
import { logger } from '@/shared/utils/logger.js'
import { registerErrorHandler } from '@/shared/interfaces/error-handler.js'
import { createStoreIdInterceptor } from '@/shared/interfaces/store-id-interceptor.js'
import { StoreRepository } from '@/repository/store-repository.js'
import { ProductRepository } from '@/repository/product-repository.js'
import { CustomizationRepository } from '@/repository/customization-repository.js'
import { AuthServiceImpl } from '@/service/auth-service.js'
import { StoreService } from '@/service/store-service.js'
import { ProductService } from '@/service/product-service.js'
import { CustomizationService } from '@/service/customization-service.js'
import { OrderService } from '@/service/order-service.js'
import { StoreController } from '@/controller/store-controller.js'
import { ProductController } from '@/controller/product-controller.js'
import { CustomizationController } from '@/controller/customization-controller.js'
import { OrderController } from '@/controller/order-controller.js'

export function createApp(): FastifyInstance {
  const app = Fastify({ logger: false })

  app.register(cors, {
    origin: config.corsOrigin,
    credentials: config.corsCredentials,
  })

  const storeRepository = new StoreRepository(db)
  const productRepository = new ProductRepository(db)
  const customizationRepository = new CustomizationRepository(db)

  const authService = new AuthServiceImpl(storeRepository)
  const storeService = new StoreService(storeRepository)
  const productService = new ProductService(productRepository)
  const customizationService = new CustomizationService(customizationRepository)
  const orderService = new OrderService()

  const storeController = new StoreController(authService, storeService)
  const productController = new ProductController(productService)
  const customizationController = new CustomizationController(customizationService)
  const orderController = new OrderController(orderService)

  registerErrorHandler(app)

  app.addHook('preHandler', createStoreIdInterceptor(authService))

  storeController.registerRoutes(app)
  productController.registerRoutes(app)
  customizationController.registerRoutes(app)
  orderController.registerRoutes(app)

  app.get('/health', async () => ({ status: 'ok' }))

  logger.info('Fastify 应用已构建')
  return app
}
