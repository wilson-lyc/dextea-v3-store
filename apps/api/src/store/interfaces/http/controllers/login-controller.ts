import type { FastifyReply, FastifyRequest } from 'fastify'
import type { LoginRequest } from '@dextea/constraints'
import { success } from '@/shared/errors/response.js'
import { loginUseCase } from '@/composition-root.js'

export async function loginController(
  request: FastifyRequest<{ Body: LoginRequest }>,
  reply: FastifyReply,
): Promise<void> {
  const result = await loginUseCase.execute(request.body)
  return reply.send(success(result))
}
