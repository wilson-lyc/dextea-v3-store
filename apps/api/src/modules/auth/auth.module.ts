import {
  apiEnvelopeSchema,
  loginRequestSchema,
  loginResponseSchema,
  type StoreView,
} from '@dextea/constraints'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { success } from '@/interfaces/http/response.js'
import type { Store } from '@/modules/store/store.model.js'
import type { AuthService } from './auth.service.js'

export interface AuthModuleOptions {
  authService: AuthService
  toStoreView: (store: Store) => StoreView
}

export function createAuthRoutes(options: AuthModuleOptions): FastifyPluginAsyncZod {
  const { authService, toStoreView } = options

  return async (app) => {
    app.post(
      '/login',
      {
        schema: {
          body: loginRequestSchema,
          response: { 200: apiEnvelopeSchema(loginResponseSchema) },
        },
      },
      async (request, reply) => {
        const { store, token } = await authService.login(request.body)

        return reply.send(
          success({
            storeId: String(store.id),
            token,
            store: toStoreView(store),
          }),
        )
      },
    )
  }
}
