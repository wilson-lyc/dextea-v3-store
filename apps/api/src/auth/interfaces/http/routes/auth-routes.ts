import type { FastifyInstance } from 'fastify'
import { loginController } from '../controllers/login-controller.js'

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/login', loginController)
}
