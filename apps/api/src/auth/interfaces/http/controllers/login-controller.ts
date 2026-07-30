import type { FastifyReply, FastifyRequest } from 'fastify'
import { loginRequestSchema } from '@dextea/constraints'
import { success } from '@/shared/errors/response.js'
import { loginUseCase } from '@/composition-root.js'

export async function loginController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = loginRequestSchema.parse(request.body)
  const result = await loginUseCase.execute(body)
  return reply.send(success(result))
}
