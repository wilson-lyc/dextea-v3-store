import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  loginRequestSchema,
  resetPasswordRequestSchema,
  updateStoreStatusRequestSchema,
  type LoginRequest,
  type ResetPasswordRequest,
  type UpdateStoreStatusRequest,
} from '@dextea/constraints'
import { success } from '@/shared/types/api-response.js'
import { authService } from '@/service/auth-service.js'
import { storeService } from '@/service/store-service.js'

export async function loginController(
  request: FastifyRequest<{ Body: LoginRequest }>,
  reply: FastifyReply,
): Promise<void> {
  const result = await authService.login(request.body as LoginRequest)
  return reply.send(success(result))
}

export async function getStoreController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  const result = await storeService.getById(storeId)
  return reply.send(success(result))
}

export async function updateStoreStatusController(
  request: FastifyRequest<{ Body: UpdateStoreStatusRequest }>,
  reply: FastifyReply,
): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  await storeService.updateStatus(storeId, request.body)
  return reply.send(success(null))
}

export async function resetPasswordController(
  request: FastifyRequest<{ Body: ResetPasswordRequest }>,
  reply: FastifyReply,
): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  await storeService.resetPassword(storeId, request.body as ResetPasswordRequest)
  return reply.send(success(null))
}

export function registerLoginRoutes(fastify: FastifyInstance): void {
  fastify.post('/login', {
    schema: {
      body: loginRequestSchema,
    },
  }, loginController)
}

export function registerStoreRoutes(fastify: FastifyInstance): void {
  fastify.get('/', getStoreController)
  fastify.put(
    '/status',
    {
      schema: {
        body: updateStoreStatusRequestSchema,
      },
    },
    updateStoreStatusController,
  )
  fastify.put(
    '/password',
    {
      schema: {
        body: resetPasswordRequestSchema,
      },
    },
    resetPasswordController,
  )
}
