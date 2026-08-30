import type { OrderDetailData, OrderWindowData } from '@dextea/constraints'

export interface OrderGatewayRequest {
  storeId: number
  authToken: string | undefined
}

export interface OrderGateway {
  getOrderWindow(request: OrderGatewayRequest): Promise<OrderWindowData>
  getOrderDetail(request: OrderGatewayRequest, orderId: number): Promise<OrderDetailData>
  markOrderReady(request: OrderGatewayRequest, orderId: number): Promise<OrderDetailData>
  markOrderCollected(
    request: OrderGatewayRequest,
    orderId: number
  ): Promise<OrderDetailData>
}
