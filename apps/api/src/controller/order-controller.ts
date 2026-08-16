import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { orderService } from '@/service/order-service.js'

export async function getOrderWindowController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  const result = await orderService.getOrderWindow(request, storeId)
  return reply.send(result)
}

export function registerOrderRoutes(fastify: FastifyInstance): void {
  fastify.get('/orders/window', getOrderWindowController)
}
