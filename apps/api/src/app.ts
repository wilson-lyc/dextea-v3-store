import Fastify, { type FastifyInstance } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { getConfig } from '@/config/index.js'
import { buildLoggerOptions } from '@/shared/logger.js'
import { getDatabase } from '@/infrastructure/database/pool.js'
import { HttpOrderGateway } from '@/infrastructure/external/order-service.client.js'
import { registerPlugins } from '@/interfaces/http/plugins.js'
import { registerErrorHandler } from '@/interfaces/http/error-handler.js'
import { registerAuthGuard } from '@/interfaces/http/auth-guard.js'
import './interfaces/http/type-augmentation.js'
import { JwtTokenService, type TokenService } from '@/modules/auth/token.service.js'
import { StoreCredentialsAuthService } from '@/modules/auth/auth.service.js'
import { createAuthRoutes } from '@/modules/auth/auth.module.js'
import {
  DrizzleStoreRepository,
  type StoreRepository,
} from '@/modules/store/store.repository.js'
import { StoreService } from '@/modules/store/store.service.js'
import { toStoreView } from '@/modules/store/store.presenter.js'
import { createStoreRoutes } from '@/modules/store/store.module.js'
import {
  DrizzleProductRepository,
  type ProductRepository,
} from '@/modules/product/product.repository.js'
import { ProductService } from '@/modules/product/product.service.js'
import { createProductRoutes } from '@/modules/product/product.module.js'
import {
  DrizzleCustomizationRepository,
  type CustomizationRepository,
} from '@/modules/customization/customization.repository.js'
import { CustomizationService } from '@/modules/customization/customization.service.js'
import { createCustomizationRoutes } from '@/modules/customization/customization.module.js'
import { OrderService } from '@/modules/order/order.service.js'
import { createOrderRoutes } from '@/modules/order/order.module.js'
import { storeEventHub } from '@/modules/store-event/store-event.service.js'
import { createStoreEventRoutes } from '@/modules/store-event/store-event.module.js'
import { createOrderServiceEndpointResolver } from '@/infrastructure/external/order-endpoint.resolver.js'
import type { OrderGateway } from '@/modules/order/order.gateway.js'
import type { OrderServiceEndpointResolver } from '@/modules/order/order.endpoint-resolver.js'

export interface AppDependencies {
  storeRepository?: StoreRepository
  productRepository?: ProductRepository
  customizationRepository?: CustomizationRepository
  orderGateway?: OrderGateway
  orderEndpointResolver?: OrderServiceEndpointResolver
  tokenService?: TokenService
}

interface RegisteredModule {
  prefix: string
  plugin: ReturnType<typeof createAuthRoutes>
}

async function registerApiModules(
  app: FastifyInstance,
  modules: RegisteredModule[]
): Promise<void> {
  for (const module of modules) {
    await app.register(module.plugin, { prefix: module.prefix })
  }
}

export async function buildApp(
  dependencies: AppDependencies = {}
): Promise<FastifyInstance> {
  const config = getConfig()

  const app = Fastify({
    logger: buildLoggerOptions(config.log.level),
    bodyLimit: 1_048_576,
    trustProxy: true,
  }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  registerErrorHandler(app)

  await registerPlugins(app)

  app.get('/health', async () => ({ status: 'ok' }))

  const storeRepository =
    dependencies.storeRepository ?? new DrizzleStoreRepository(getDatabase())
  const productRepository =
    dependencies.productRepository ?? new DrizzleProductRepository(getDatabase())
  const customizationRepository =
    dependencies.customizationRepository ??
    new DrizzleCustomizationRepository(getDatabase())
  const orderEndpointResolver =
    dependencies.orderEndpointResolver ?? createOrderServiceEndpointResolver()
  const orderGateway =
    dependencies.orderGateway ?? new HttpOrderGateway(orderEndpointResolver)

  const tokenService = dependencies.tokenService ?? new JwtTokenService()
  const authService = new StoreCredentialsAuthService(storeRepository, tokenService)
  const storeService = new StoreService(storeRepository)
  const productService = new ProductService(productRepository)
  const customizationService = new CustomizationService(customizationRepository)
  const orderService = new OrderService(orderGateway)

  // 注册在插件之后：CORS 预检（OPTIONS）需先于鉴权拦截器处理
  registerAuthGuard(app, tokenService)

  const modules: RegisteredModule[] = [
    { prefix: '/api/v1/auth', plugin: createAuthRoutes({ authService, toStoreView }) },
    { prefix: '/api/v1/store', plugin: createStoreRoutes({ storeService }) },
    { prefix: '/api/v1/products', plugin: createProductRoutes({ productService }) },
    {
      prefix: '/api/v1/products',
      plugin: createCustomizationRoutes({ customizationService }),
    },
    { prefix: '/api/v1/store', plugin: createOrderRoutes({ orderService }) },
    { prefix: '/api/v1/store', plugin: createStoreEventRoutes({ storeEventHub }) },
  ]

  await registerApiModules(app, modules)

  app.addHook('onClose', async () => {
    app.log.info('[app] Fastify 应用已关闭')
  })

  app.log.info(`[app] Fastify 应用已构建 (${config.nodeEnv})`)

  return app
}
