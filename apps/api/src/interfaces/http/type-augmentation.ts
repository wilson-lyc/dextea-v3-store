import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    storeId?: number
    authToken?: string
  }

  interface FastifyContextConfig {
    publicRoute?: boolean
  }
}
