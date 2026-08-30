import type { z } from 'zod'
import {
  orderDetailResponseSchema,
  orderWindowResponseSchema,
  type OrderDetailData,
  type OrderWindowData,
} from '@dextea/constraints'
import { getLogger } from '@/shared/logger.js'
import type { OrderGateway, OrderGatewayRequest } from '@/modules/order/order.gateway.js'
import {
  OrderServiceEndpointUnavailableError,
  type OrderServiceEndpointResolver,
} from '@/modules/order/order.endpoint-resolver.js'

export class UpstreamServiceError extends Error {
  public readonly upstream: string
  public readonly status: number | undefined

  public constructor(upstream: string, status: number | undefined, message: string) {
    super(message)
    this.name = 'UpstreamServiceError'
    this.upstream = upstream
    this.status = status
  }
}

interface UpstreamEnvelopeShape<T> {
  code: number
  message: string
  data: T
}

const SUCCESS_CODE = 0

export class HttpOrderGateway implements OrderGateway {
  private readonly logger = getLogger()

  public constructor(private readonly endpointResolver: OrderServiceEndpointResolver) {}

  public async getOrderWindow(request: OrderGatewayRequest): Promise<OrderWindowData> {
    const payload = await this.request(
      request,
      '/api/v1/store/orders/window?hours=3',
      'GET'
    )
    return this.parseUpstream<OrderWindowData>(
      orderWindowResponseSchema,
      payload,
      'GET /orders/window'
    )
  }

  public async getOrderDetail(
    request: OrderGatewayRequest,
    orderId: number
  ): Promise<OrderDetailData> {
    const payload = await this.request(request, `/api/v1/store/orders/${orderId}`, 'GET')
    return this.parseUpstream<OrderDetailData>(
      orderDetailResponseSchema,
      payload,
      `GET /orders/${orderId}`
    )
  }

  public async markOrderReady(
    request: OrderGatewayRequest,
    orderId: number
  ): Promise<OrderDetailData> {
    const payload = await this.request(
      request,
      `/api/v1/store/orders/${orderId}/ready`,
      'POST'
    )
    return this.parseUpstream<OrderDetailData>(
      orderDetailResponseSchema,
      payload,
      `POST /orders/${orderId}/ready`
    )
  }

  public async markOrderCollected(
    request: OrderGatewayRequest,
    orderId: number
  ): Promise<OrderDetailData> {
    const payload = await this.request(
      request,
      `/api/v1/store/orders/${orderId}/collect`,
      'POST'
    )
    return this.parseUpstream<OrderDetailData>(
      orderDetailResponseSchema,
      payload,
      `POST /orders/${orderId}/collect`
    )
  }

  private parseUpstream<T>(
    schema: z.ZodType<UpstreamEnvelopeShape<T>>,
    payload: unknown,
    context: string
  ): T {
    const parsed = schema.safeParse(payload)

    if (!parsed.success) {
      this.logger.error({ payload, context }, '[order-gateway] 订单微服务响应结构非法')
      throw new UpstreamServiceError('order-service', undefined, '订单服务响应结构非法')
    }

    if (parsed.data.code !== SUCCESS_CODE) {
      throw new UpstreamServiceError('order-service', undefined, parsed.data.message)
    }

    return parsed.data.data
  }

  private async request(
    request: OrderGatewayRequest,
    path: string,
    method: 'GET' | 'POST'
  ): Promise<unknown> {
    const baseUrl = await this.resolveBaseUrl()
    const target = `${baseUrl}${path}`
    const headers: Record<string, string> = {
      'X-Store-Id': String(request.storeId),
    }

    if (request.authToken) {
      headers.Authorization = `Bearer ${request.authToken}`
    }
    if (method === 'POST') {
      headers['Content-Type'] = 'application/json'
    }

    let response: Response
    try {
      response = await fetch(target, {
        method,
        headers,
        ...(method === 'POST' ? { body: '{}' } : {}),
      })
    } catch (error) {
      this.logger.error(
        { error, context: path, target },
        '[order-gateway] 调用订单微服务失败'
      )

      if (error instanceof UpstreamServiceError) {
        throw error
      }

      throw new UpstreamServiceError('order-service', undefined, '订单服务网络不可达')
    }

    if (!response.ok) {
      this.logger.error(
        `[order-gateway] 订单微服务返回 ${response.status} ${method} ${path}`
      )
      throw new UpstreamServiceError('order-service', response.status, '订单服务响应异常')
    }

    return response.json()
  }

  private async resolveBaseUrl(): Promise<string> {
    try {
      return await this.endpointResolver.resolveBaseUrl()
    } catch (error) {
      if (error instanceof OrderServiceEndpointUnavailableError) {
        this.logger.error(
          { reason: error.message },
          '[order-gateway] 未解析到订单微服务实例'
        )
        throw new UpstreamServiceError('order-service', undefined, '订单服务实例不可用')
      }

      throw error
    }
  }
}
