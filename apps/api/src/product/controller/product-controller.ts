import type { FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@/shared/errors/response.js'
import { listActiveProductsService } from '@/composition-root.js'

export async function listActiveProductsController(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const result = await listActiveProductsService.execute()
  return reply.send(success(result))
}

export function registerProductRoutes(
  fastify: import('fastify').FastifyInstance,
): void {
  fastify.get('/', listActiveProductsController)
}
