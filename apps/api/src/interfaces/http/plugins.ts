import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { getConfig } from '@/config/index.js'

export async function registerPlugins(app: FastifyInstance): Promise<void> {
  const { server, nodeEnv } = getConfig()

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })

  await app.register(cors, {
    origin: server.cors.origin,
    credentials: server.cors.credentials,
  })

  if (nodeEnv === 'production') {
    return
  }

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'DexTea 店铺端 API',
        description: '门店登录、门店信息、商品与客制化、订单制作',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list' },
  })
}
