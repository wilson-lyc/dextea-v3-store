import { z } from 'zod'
import {
  apiEnvelopeSchema,
  orderDetailDataSchema,
  orderWindowDataSchema,
} from '@dextea/constraints'
import type { FastifyRequest } from 'fastify'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { requireAuthToken, requireStoreId } from '@/interfaces/http/store-context.js'
import { success } from '@/interfaces/http/response.js'
import type { OrderGatewayRequest } from './order.gateway.js'
import type { OrderService } from './order.service.js'

const orderIdParamsSchema = z.object({
  orderId: z.coerce.number().int().positive({ message: '订单ID无效' }),
})

const windowResponseSchema = apiEnvelopeSchema(orderWindowDataSchema)
const detailResponseSchema = apiEnvelopeSchema(orderDetailDataSchema)

export interface OrderModuleOptions {
  orderService: OrderService
}

export function createOrderRoutes(options: OrderModuleOptions): FastifyPluginAsyncZod {
  const { orderService } = options

  return async (app) => {
    app.get(
      '/orders/window',
      { schema: { response: { 200: windowResponseSchema } } },
      async (request, reply) => {
        const result = await orderService.getOrderWindow(buildGatewayRequest(request))
        return reply.send(success(result))
      },
    )

    app.get(
      '/orders/:orderId',
      { schema: { params: orderIdParamsSchema, response: { 200: detailResponseSchema } } },
      async (request, reply) => {
        const result = await orderService.getOrderDetail(
          buildGatewayRequest(request),
          request.params.orderId,
        )
        return reply.send(success(result))
      },
    )

    app.post(
      '/orders/:orderId/ready',
      { schema: { params: orderIdParamsSchema, response: { 200: detailResponseSchema } } },
      async (request, reply) => {
        const result = await orderService.markOrderReady(
          buildGatewayRequest(request),
          request.params.orderId,
        )
        return reply.send(success(result))
      },
    )

    app.post(
      '/orders/:orderId/collect',
      { schema: { params: orderIdParamsSchema, response: { 200: detailResponseSchema } } },
      async (request, reply) => {
        const result = await orderService.markOrderCollected(
          buildGatewayRequest(request),
          request.params.orderId,
        )
        return reply.send(success(result))
      },
    )
  }
}

function buildGatewayRequest(request: FastifyRequest): OrderGatewayRequest {
  return {
    storeId: requireStoreId(request),
    authToken: requireAuthToken(request),
  }
}
