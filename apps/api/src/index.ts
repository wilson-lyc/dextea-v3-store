import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import { registerErrorHandler } from '@/shared/interfaces/error-handler.js'
import { createStoreIdInterceptor } from '@/shared/interfaces/store-id-interceptor.js'
import { logger } from '@/shared/utils/logger.js'
import { jwtService } from '@/service/jwt-service.js'
import { registerLoginRoutes, registerStoreRoutes } from '@/controller/store-controller.js'
import { registerProductRoutes } from '@/controller/product-controller.js'

const app = Fastify({
  logger: true,
})
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler)
  .withTypeProvider<ZodTypeProvider>()

await app.register(helmet)
await app.register(cors)
app.addHook('onRequest', createStoreIdInterceptor(jwtService))
await app.register(registerLoginRoutes, { prefix: '/api/v1/auth' })
await app.register(registerStoreRoutes, { prefix: '/api/v1/store' })
await app.register(registerProductRoutes, { prefix: '/api/v1/products' })

registerErrorHandler(app)

try {
  const port = Number(process.env.PORT ?? 3000)
  await app.listen({ port, host: '0.0.0.0' })
  logger.info(`服务已启动，监听端口 ${port}`)
} catch (err) {
  logger.error('服务启动失败', err)
  process.exit(1)
}
