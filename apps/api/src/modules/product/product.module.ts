import { z } from 'zod'
import {
  apiEnvelopeSchema,
  batchUpdateProductStoreStatusRequestSchema,
  ProductStoreStatus,
  productViewSchema,
} from '@dextea/constraints'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { requireStoreId } from '@/interfaces/http/store-context.js'
import { success } from '@/interfaces/http/response.js'
import { toProductView } from './product.presenter.js'
import type { ProductService } from './product.service.js'

const storeStatusResponseSchema = apiEnvelopeSchema(
  z.object({ storeStatus: ProductStoreStatus.schema() }),
)
const productIdParamsSchema = z.object({
  productId: z.coerce.number().int().positive({ message: '商品ID无效' }),
})
const productListResponseSchema = apiEnvelopeSchema(z.array(productViewSchema))
const nullResponseSchema = apiEnvelopeSchema(z.null())

export interface ProductModuleOptions {
  productService: ProductService
}

export function createProductRoutes(options: ProductModuleOptions): FastifyPluginAsyncZod {
  const { productService } = options

  return async (app) => {
    app.get(
      '/',
      { schema: { response: { 200: productListResponseSchema } } },
      async (request, reply) => {
        const items = await productService.listActiveByStore(requireStoreId(request))
        return reply.send(success(items.map((item) => toProductView(item.product, item.storeStatus))))
      },
    )

    app.patch(
      '/:productId/store-status',
      {
        schema: {
          params: productIdParamsSchema,
          response: { 200: storeStatusResponseSchema },
        },
      },
      async (request, reply) => {
        const storeStatus = await productService.toggleStoreStatus(
          requireStoreId(request),
          request.params.productId,
        )
        return reply.send(success({ storeStatus }))
      },
    )

    app.post(
      '/batch/store-status',
      {
        schema: {
          body: batchUpdateProductStoreStatusRequestSchema,
          response: { 200: nullResponseSchema },
        },
      },
      async (request, reply) => {
        const { productIds, status } = request.body
        await productService.batchSetStoreStatus(requireStoreId(request), productIds, status)
        return reply.send(success(null))
      },
    )
  }
}
