import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import {
  resetPasswordRequestSchema,
  updateStoreStatusRequestSchema,
} from '@dextea/constraints'
import {
  getStoreController,
  resetPasswordController,
  updateStoreStatusController,
} from '../controllers/store-controller.js'

export const storeRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', getStoreController)
  app.put(
    '/status',
    {
      schema: {
        body: updateStoreStatusRequestSchema,
      },
    },
    updateStoreStatusController,
  )
  app.put(
    '/password',
    {
      schema: {
        body: resetPasswordRequestSchema,
      },
    },
    resetPasswordController,
  )
}
