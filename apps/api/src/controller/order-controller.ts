import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { orderService } from '@/service/order-service.js'

export async function getOrderWindowController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  const result = await orderService.getOrderWindow(request, storeId)
  return reply.send(result)
}

interface OrderParams {
  id: string
}

export async function getOrderDetailController(
  request: FastifyRequest<{ Params: OrderParams }>,
  reply: FastifyReply,
): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  const orderId = Number(request.params.id)
  const result = await orderService.getOrderDetail(request, storeId, orderId)
  return reply.send(result)
}

export async function markOrderReadyController(
  request: FastifyRequest<{ Params: OrderParams }>,
  reply: FastifyReply,
): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  const orderId = Number(request.params.id)
  const result = await orderService.markOrderReady(request, storeId, orderId)
  return reply.send(result)
}

export async function markOrderCollectedController(
  request: FastifyRequest<{ Params: OrderParams }>,
  reply: FastifyReply,
): Promise<void> {
  const storeId = Number(request.headers['x-store-id'])
  const orderId = Number(request.params.id)
  const result = await orderService.markOrderCollected(request, storeId, orderId)
  return reply.send(result)
}

export function registerOrderRoutes(fastify: FastifyInstance): void {
  fastify.get('/orders/window', getOrderWindowController)
  fastify.get('/orders/:id', getOrderDetailController)
  fastify.post('/orders/:id/ready', markOrderReadyController)
  fastify.post('/orders/:id/collect', markOrderCollectedController)
}
