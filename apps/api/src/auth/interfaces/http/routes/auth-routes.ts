import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { loginRequestSchema } from '@dextea/constraints'
import { loginController } from '../controllers/login-controller.js'

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post('/login', {
    schema: {
      body: loginRequestSchema,
    },
  }, loginController)
}
