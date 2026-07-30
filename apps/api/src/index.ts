import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import { registerErrorHandler } from '@/shared/interfaces/error-handler.js'
import { createStoreIdInterceptor } from '@/shared/interfaces/store-id-interceptor.js'
import { logger } from '@/shared/utils/logger.js'
import { jwtService } from '@/auth/infrastructure/jwt/jwt-service.js'
import { authRoutes } from '@/auth/interfaces/http/routes/auth-routes.js'
import { storeRoutes } from '@/store/interfaces/http/routes/store-routes.js'

const app = Fastify({
  logger: true,
})
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler)
  .withTypeProvider<ZodTypeProvider>()

await app.register(helmet)
await app.register(cors)
app.addHook('onRequest', createStoreIdInterceptor(jwtService))
await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(storeRoutes, { prefix: '/api/stores' })

registerErrorHandler(app)

try {
  const port = Number(process.env.PORT ?? 3000)
  await app.listen({ port, host: '0.0.0.0' })
  logger.info(`服务已启动，监听端口 ${port}`)
} catch (err) {
  logger.error('服务启动失败', err)
  process.exit(1)
}
