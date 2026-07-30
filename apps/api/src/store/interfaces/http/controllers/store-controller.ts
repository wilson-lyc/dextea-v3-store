import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ResetPasswordRequest, UpdateStoreStatusRequest } from '@dextea/constraints'
import { success } from '@/shared/errors/response.js'
import {
  getStoreUseCase,
  resetPasswordUseCase,
  updateStoreStatusUseCase,
} from '@/composition-root.js'

export async function getStoreController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  const result = await getStoreUseCase.execute(storeId)
  return reply.send(success(result))
}

export async function updateStoreStatusController(
  request: FastifyRequest<{ Body: UpdateStoreStatusRequest }>,
  reply: FastifyReply,
): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  await updateStoreStatusUseCase.execute(storeId, request.body.status)
  return reply.send(success(null))
}

export async function resetPasswordController(
  request: FastifyRequest<{ Body: ResetPasswordRequest }>,
  reply: FastifyReply,
): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  await resetPasswordUseCase.execute(storeId, request.body)
  return reply.send(success(null))
}
