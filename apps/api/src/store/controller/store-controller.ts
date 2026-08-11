import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  loginRequestSchema,
  resetPasswordRequestSchema,
  updateStoreStatusRequestSchema,
  type LoginRequest,
  type ResetPasswordRequest,
  type UpdateStoreStatusRequest,
} from '@dextea/constraints'
import { success } from '@/shared/errors/response.js'
import { loginService } from '@/store/service/login-service.js'
import { getStoreService } from '@/store/service/get-store-service.js'
import { updateStoreStatusService } from '@/store/service/update-store-status-service.js'
import { resetPasswordService } from '@/store/service/reset-password-service.js'

export async function loginController(
  request: FastifyRequest<{ Body: LoginRequest }>,
  reply: FastifyReply,
): Promise<void> {
  const result = await loginService.execute(request.body as LoginRequest)
  return reply.send(success(result))
}

export async function getStoreController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  const result = await getStoreService.execute(storeId)
  return reply.send(success(result))
}

export async function updateStoreStatusController(
  request: FastifyRequest<{ Body: UpdateStoreStatusRequest }>,
  reply: FastifyReply,
): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  await updateStoreStatusService.execute(storeId, request.body as UpdateStoreStatusRequest)
  return reply.send(success(null))
}

export async function resetPasswordController(
  request: FastifyRequest<{ Body: ResetPasswordRequest }>,
  reply: FastifyReply,
): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  await resetPasswordService.execute(storeId, request.body as ResetPasswordRequest)
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
