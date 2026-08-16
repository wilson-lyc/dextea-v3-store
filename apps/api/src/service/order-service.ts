import type { FastifyRequest } from 'fastify'
import { config } from '../config.js'
import { OrderWindowResponse } from '@dextea/constraints'
import { BizError } from '../shared/errors/biz-error.js'
import { OrderError } from '../error/order-error.js'
import { logger } from '../shared/utils/logger.js'

export class OrderService {
  async getOrderWindow(request: FastifyRequest, storeId: number): Promise<OrderWindowResponse> {
    const target = `${config.orderService.baseUrl}/api/v1/store/orders/window`

    const authorization = request.headers['authorization']

    const response = await fetch(target, {
      method: 'GET',
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
        'X-Store-Id': String(storeId),
      },
    })

    if (!response.ok) {
      logger.error(`[order-service] order microservice responded ${response.status} for store ${storeId}`)
      throw new BizError(OrderError.ORDER_SERVICE_UNAVAILABLE)
    }

    const result = (await response.json()) as OrderWindowResponse
    return result
  }
}

export const orderService = new OrderService()
