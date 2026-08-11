import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@/shared/errors/response.js'
import { listActiveProductsService } from '@/product/service/list-active-products-service.js'

export async function listActiveProductsController(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const result = await listActiveProductsService.execute()
  return reply.send(success(result))
}

export function registerProductRoutes(fastify: FastifyInstance): void {
  fastify.get('/', listActiveProductsController)
}
