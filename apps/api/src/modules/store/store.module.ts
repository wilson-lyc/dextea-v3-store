import { z } from 'zod'
import {
  apiEnvelopeSchema,
  resetPasswordRequestSchema,
  storeViewSchema,
  updateStoreStatusRequestSchema,
} from '@dextea/constraints'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { requireStoreId } from '@/interfaces/http/store-context.js'
import { success } from '@/interfaces/http/response.js'
import { toStoreView } from './store.presenter.js'
import type { StoreService } from './store.service.js'
import type { StoreCredentialsService } from '@/modules/auth/store-credentials.service.js'

const nullResponseSchema = apiEnvelopeSchema(z.null())
const storeViewResponseSchema = apiEnvelopeSchema(storeViewSchema)

export interface StoreModuleOptions {
  storeService: StoreService
  credentialsService: StoreCredentialsService
}

export function createStoreRoutes(options: StoreModuleOptions): FastifyPluginAsyncZod {
  const { storeService, credentialsService } = options

  return async (app) => {
    app.get(
      '/',
      { schema: { response: { 200: storeViewResponseSchema } } },
      async (request, reply) => {
        const store = await storeService.getById(requireStoreId(request))
        return reply.send(success(toStoreView(store)))
      }
    )

    app.put(
      '/status',
      {
        schema: {
          body: updateStoreStatusRequestSchema,
          response: { 200: nullResponseSchema },
        },
      },
      async (request, reply) => {
        await storeService.updateStatus(requireStoreId(request), request.body.status)
        return reply.send(success(null))
      }
    )

    app.put(
      '/password',
      {
        schema: {
          body: resetPasswordRequestSchema,
          response: { 200: nullResponseSchema },
        },
      },
      async (request, reply) => {
        await credentialsService.changePassword(requireStoreId(request), request.body)
        return reply.send(success(null))
      }
    )
  }
}
