import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@/shared/types/api-response.js'
import { customizationService } from '@/service/customization-service.js'
import { listProductCustomizationsRequestSchema } from '@dextea/constraints'

interface ListCustomizationsParams {
  productId: string
}

interface ListCustomizationsQuery {
  storeId?: string
}

export async function listProductCustomizationsController(
  request: FastifyRequest<{ Params: ListCustomizationsParams }>,
  reply: FastifyReply,
): Promise<void> {
  const query = request.query as ListCustomizationsQuery
  const parsed = listProductCustomizationsRequestSchema.safeParse({
    productId: request.params.productId,
    storeId: query.storeId ?? request.headers['x-store-id'],
  })

  if (!parsed.success) {
    return reply.code(400).send({ message: parsed.error.issues[0]?.message ?? '请求参数无效' })
  }

  const result = await customizationService.listByProductAndStore(
    parsed.data.productId,
    parsed.data.storeId,
  )
  return reply.send(success(result))
}

export function registerCustomizationRoutes(fastify: FastifyInstance): void {
  fastify.get('/:productId/customizations', listProductCustomizationsController)
}
