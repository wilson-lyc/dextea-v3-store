import { apiEnvelopeSchema, loginRequestSchema, loginResponseSchema } from '@dextea/constraints'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { success } from '@/interfaces/http/response.js'
import type { AuthService } from './auth.service.js'

export interface AuthModuleOptions {
  authService: AuthService
}

export function createAuthRoutes(options: AuthModuleOptions): FastifyPluginAsyncZod {
  const { authService } = options

  return async (app) => {
    app.post(
      '/login',
      {
        config: { publicRoute: true },
        schema: {
          body: loginRequestSchema,
          response: { 200: apiEnvelopeSchema(loginResponseSchema) },
        },
      },
      async (request, reply) => {
        return reply.send(success(await authService.login(request.body)))
      },
    )
  }
}
