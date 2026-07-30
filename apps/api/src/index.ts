import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { registerErrorHandler } from '@/shared/interfaces/error-handler.js'
import { logger } from '@/shared/utils/logger.js'
import { authRoutes } from '@/auth/interfaces/http/routes/auth-routes.js'

const app = Fastify({
  logger: true,
})

await app.register(helmet)
await app.register(cors)
await app.register(authRoutes, { prefix: '/api/auth' })

registerErrorHandler(app)

try {
  const port = Number(process.env.PORT ?? 3000)
  await app.listen({ port, host: '0.0.0.0' })
  logger.info(`服务已启动，监听端口 ${port}`)
} catch (err) {
  logger.error('服务启动失败', err)
  process.exit(1)
}
