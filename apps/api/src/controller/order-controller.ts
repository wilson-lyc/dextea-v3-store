import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { OrderService } from '@/service/order-service.js'

interface OrderParams {
  id: string
}

export class OrderController {
  public constructor(private readonly orderService: OrderService) {}

  public async getOrderWindow(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const storeId = Number(request.headers['x-store-id'])
    const result = await this.orderService.getOrderWindow(request, storeId)
    return reply.send(result)
  }

  public async getOrderDetail(
    request: FastifyRequest<{ Params: OrderParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const storeId = Number(request.headers['x-store-id'])
    const orderId = Number(request.params.id)
    const result = await this.orderService.getOrderDetail(request, storeId, orderId)
    return reply.send(result)
  }

  public async markOrderReady(
    request: FastifyRequest<{ Params: OrderParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const storeId = Number(request.headers['x-store-id'])
    const orderId = Number(request.params.id)
    const result = await this.orderService.markOrderReady(request, storeId, orderId)
    return reply.send(result)
  }

  public async markOrderCollected(
    request: FastifyRequest<{ Params: OrderParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const storeId = Number(request.headers['x-store-id'])
    const orderId = Number(request.params.id)
    const result = await this.orderService.markOrderCollected(request, storeId, orderId)
    return reply.send(result)
  }

  public registerRoutes(fastify: FastifyInstance): void {
    fastify.get('/orders/window', this.getOrderWindow.bind(this))
    fastify.get('/orders/:id', this.getOrderDetail.bind(this))
    fastify.post('/orders/:id/ready', this.markOrderReady.bind(this))
    fastify.post('/orders/:id/collect', this.markOrderCollected.bind(this))
  }
}
