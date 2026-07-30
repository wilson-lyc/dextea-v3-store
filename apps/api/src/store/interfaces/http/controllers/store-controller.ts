import type { FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@/shared/errors/response.js'
import { getStoreUseCase } from '@/composition-root.js'

export async function getStoreController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  const result = await getStoreUseCase.execute(storeId)
  return reply.send(success(result))
}
