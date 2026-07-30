import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getStoreController } from '../controllers/store-controller.js'

export const storeRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', getStoreController)
}
