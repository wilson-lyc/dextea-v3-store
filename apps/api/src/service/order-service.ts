import type { FastifyRequest } from 'fastify'
import { config } from '../config.js'
import { OrderDetailResponse, OrderWindowResponse } from '@dextea/constraints'
import { BizError } from '../shared/errors/biz-error.js'
import { OrderError } from '../error/order-error.js'
import { logger } from '../shared/utils/logger.js'

export class OrderService {
  private async forward<T>(request: FastifyRequest, storeId: number, path: string): Promise<T> {
    const target = `${config.orderService.baseUrl}${path}`
    const authorization = request.headers['authorization']

    const response = await fetch(target, {
      method: 'GET',
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
        'X-Store-Id': String(storeId),
      },
    })

    if (!response.ok) {
      logger.error(`[order-service] order microservice responded ${response.status} for ${path}`)
      throw new BizError(OrderError.ORDER_SERVICE_UNAVAILABLE)
    }

    return (await response.json()) as T
  }

  async getOrderWindow(request: FastifyRequest, storeId: number): Promise<OrderWindowResponse> {
    return this.forward<OrderWindowResponse>(request, storeId, '/api/v1/store/orders/window?hours=3')
  }

  async getOrderDetail(request: FastifyRequest, storeId: number, orderId: number): Promise<OrderDetailResponse> {
    return this.forward<OrderDetailResponse>(request, storeId, `/api/v1/store/orders/${orderId}`)
  }
}

export const orderService = new OrderService()
