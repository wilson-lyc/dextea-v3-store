import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import { registerErrorHandler } from '@/shared/interfaces/error-handler.js'
import { createStoreIdInterceptor } from '@/shared/interfaces/store-id-interceptor.js'
import { logger } from '@/shared/utils/logger.js'
import { config } from '@/config.js'
import { authService } from '@/service/auth-service.js'
import { registerLoginRoutes, registerStoreRoutes } from '@/controller/store-controller.js'
import { registerProductRoutes } from '@/controller/product-controller.js'

const app = Fastify({
  logger: true,
})
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler)
  .withTypeProvider<ZodTypeProvider>()

await app.register(helmet)
const corsOriginRaw = config.corsOrigin.trim()
const corsOrigin = corsOriginRaw === '*' || corsOriginRaw === ''
  ? true
  : corsOriginRaw.split(',').map((o) => o.trim()).filter(Boolean)
await app.register(cors, {
  origin: corsOrigin,
  credentials: config.corsCredentials,
})
app.addHook('onRequest', createStoreIdInterceptor(authService))
await app.register(registerLoginRoutes, { prefix: '/api/v1/auth' })
await app.register(registerStoreRoutes, { prefix: '/api/v1/store' })
await app.register(registerProductRoutes, { prefix: '/api/v1/products' })

registerErrorHandler(app)

try {
  await app.listen({ port: config.port, host: config.host })
  logger.info(`Server started, listening on port ${config.port}`)
} catch (err) {
  logger.error('Failed to start server', err)
  process.exit(1)
}
