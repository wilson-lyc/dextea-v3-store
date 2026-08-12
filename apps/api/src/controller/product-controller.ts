import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@/shared/types/api-response.js'
import { productService } from '@/service/product-service.js'
import type { ProductStoreStatusCode } from '@dextea/constraints'

export async function listActiveProductsController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  const result = await productService.listActiveByStore(storeId)
  return reply.send(success(result))
}

interface ToggleStoreStatusParams {
  id: string
}

export async function toggleStoreStatusController(
  request: FastifyRequest<{ Params: ToggleStoreStatusParams }>,
  reply: FastifyReply,
): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  const productId = Number(request.params.id)
  const storeStatus = await productService.toggleStoreStatus(storeId, productId)
  return reply.send(success({ storeStatus }))
}

interface BatchStoreStatusBody {
  productIds: unknown
  status: unknown
}

export async function batchStoreStatusController(
  request: FastifyRequest<{ Body: BatchStoreStatusBody }>,
  reply: FastifyReply,
): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  const { productIds, status } = request.body
  if (
    !Array.isArray(productIds) ||
    productIds.length === 0 ||
    !productIds.every((id) => typeof id === 'number')
  ) {
    return reply.code(400).send({ message: 'productIds 必须为非空数字数组' })
  }
  if (typeof status !== 'number') {
    return reply.code(400).send({ message: 'status 必须为数字' })
  }
  await productService.batchSetStoreStatus(
    storeId,
    productIds as number[],
    status as ProductStoreStatusCode,
  )
  return reply.send(success(null))
}

export function registerProductRoutes(fastify: FastifyInstance): void {
  fastify.get('/', listActiveProductsController)
  fastify.patch('/:id/store-status', toggleStoreStatusController)
  fastify.post('/batch/store-status', batchStoreStatusController)
}
