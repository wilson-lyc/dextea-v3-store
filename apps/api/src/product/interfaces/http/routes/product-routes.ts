import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { listActiveProductsController } from '../controllers/product-controller.js'

export const productRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', listActiveProductsController)
}
