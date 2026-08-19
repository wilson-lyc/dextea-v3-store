import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@/shared/types/api-response.js'
import type { ProductService } from '@/service/product-service.js'
import type { ProductStoreStatusCode } from '@dextea/constraints'

interface ToggleStoreStatusParams {
  id: string
}

interface BatchStoreStatusBody {
  productIds: unknown
  status: unknown
}

export class ProductController {
  public constructor(private readonly productService: ProductService) {}

  public async listActive(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const storeId = Number(request.headers['x-store-id'])
    const result = await this.productService.listActiveByStore(storeId)
    return reply.send(success(result))
  }

  public async toggleStoreStatus(
    request: FastifyRequest<{ Params: ToggleStoreStatusParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const storeId = Number(request.headers['x-store-id'])
    const productId = Number(request.params.id)
    const storeStatus = await this.productService.toggleStoreStatus(storeId, productId)
    return reply.send(success({ storeStatus }))
  }

  public async batchStoreStatus(
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
    await this.productService.batchSetStoreStatus(
      storeId,
      productIds as number[],
      status as ProductStoreStatusCode,
    )
    return reply.send(success(null))
  }

  public registerRoutes(fastify: FastifyInstance): void {
    fastify.get('/', this.listActive.bind(this))
    fastify.patch('/:id/store-status', this.toggleStoreStatus.bind(this))
    fastify.post('/batch/store-status', this.batchStoreStatus.bind(this))
  }
}
