import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { registerErrorHandler } from '@/shared/interfaces/error-handler.js'
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
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
