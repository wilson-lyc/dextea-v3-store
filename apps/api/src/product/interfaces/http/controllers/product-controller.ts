import type { FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@/shared/errors/response.js'
import { listActiveProductsUseCase } from '@/composition-root.js'

export async function listActiveProductsController(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const result = await listActiveProductsUseCase.execute()
  return reply.send(success(result))
}
