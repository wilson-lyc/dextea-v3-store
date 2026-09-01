import type { OrderDetailData, OrderWindowData } from '@dextea/constraints'
import { BizError, type BizErrorDefinition } from '@/shared/errors.js'
import { getLogger } from '@/shared/logger.js'
import { UpstreamServiceError } from '@/infrastructure/external/order-service.client.js'
import { orderErrors } from './order.error.js'
import type { OrderGateway, OrderGatewayRequest } from './order.gateway.js'

// 订单微服务业务码 → 本服务具体业务错误（文案与 HTTP 状态对齐接口文档）
const UPSTREAM_CODE_TO_ORDER_ERROR: Readonly<Record<number, BizErrorDefinition>> = {
  21016: orderErrors.ORDER_NOT_FOUND,
  21019: orderErrors.ORDER_NOT_BELONG_TO_STORE,
  21027: orderErrors.ORDER_MAKING_STATUS_INVALID,
  40001: orderErrors.ORDER_PARAM_INVALID,
  40002: orderErrors.ORDER_PARAM_INVALID,
  40100: orderErrors.ORDER_UNAUTHORIZED,
  50000: orderErrors.ORDER_SYSTEM_BUSY,
  50101: orderErrors.ORDER_SYSTEM_BUSY,
}

function toOrderBizError(error: UpstreamServiceError): BizError {
  const matched =
    error.code !== undefined ? UPSTREAM_CODE_TO_ORDER_ERROR[error.code] : undefined
  if (matched) return new BizError(matched)

  if (error.status !== undefined && error.status >= 500) {
    return new BizError(orderErrors.ORDER_SERVICE_UNAVAILABLE)
  }
  if (error.status === 401) return new BizError(orderErrors.ORDER_UNAUTHORIZED)
  if (error.status !== undefined && error.status >= 400) {
    return new BizError(orderErrors.ORDER_UPSTREAM_ERROR)
  }
  return new BizError(orderErrors.ORDER_SERVICE_UNAVAILABLE)
}

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
  ): Promise<null> {
    return this.forward(() => this.orderGateway.markOrderReady(request, orderId))
  }

  public async markOrderCollected(
    request: OrderGatewayRequest,
    orderId: number
  ): Promise<null> {
    return this.forward(() => this.orderGateway.markOrderCollected(request, orderId))
  }

  private async forward<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof UpstreamServiceError) {
        this.logger.error(
          {
            upstream: error.upstream,
            status: error.status,
            code: error.code,
            message: error.message,
          },
          '[order] 调用订单微服务失败'
        )
        throw toOrderBizError(error)
      }

      throw error
    }
  }
}
