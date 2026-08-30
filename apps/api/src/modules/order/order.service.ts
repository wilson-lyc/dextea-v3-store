import type { OrderDetailData, OrderWindowData } from '@dextea/constraints'
import { BizError } from '@/shared/errors.js'
import { getLogger } from '@/shared/logger.js'
import { UpstreamServiceError } from '@/infrastructure/external/order-service.client.js'
import { orderErrors } from './order.error.js'
import type { OrderGateway, OrderGatewayRequest } from './order.gateway.js'

export class OrderService {
  private readonly logger = getLogger()

  public constructor(private readonly orderGateway: OrderGateway) {}

  public async getOrderWindow(request: OrderGatewayRequest): Promise<OrderWindowData> {
    return this.forward(() => this.orderGateway.getOrderWindow(request))
  }

  public async getOrderDetail(
    request: OrderGatewayRequest,
    orderId: number
  ): Promise<OrderDetailData> {
    return this.forward(() => this.orderGateway.getOrderDetail(request, orderId))
  }

  public async markOrderReady(
    request: OrderGatewayRequest,
    orderId: number
  ): Promise<OrderDetailData> {
    return this.forward(() => this.orderGateway.markOrderReady(request, orderId))
  }

  public async markOrderCollected(
    request: OrderGatewayRequest,
    orderId: number
  ): Promise<OrderDetailData> {
    return this.forward(() => this.orderGateway.markOrderCollected(request, orderId))
  }

  private async forward<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof UpstreamServiceError) {
        this.logger.error(
          { upstream: error.upstream, status: error.status, message: error.message },
          '[order] 调用订单微服务失败'
        )
        throw new BizError(orderErrors.ORDER_SERVICE_UNAVAILABLE)
      }

      throw error
    }
  }
}
