import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import type { FastifyInstance } from 'fastify'
import { getConfig } from '@/config/index.js'

export async function registerPlugins(app: FastifyInstance): Promise<void> {
  const { server } = getConfig()

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })

  await app.register(cors, {
    origin: server.cors.origin,
    credentials: server.cors.credentials,
  })
}
