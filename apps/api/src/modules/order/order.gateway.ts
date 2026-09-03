import type {
  OrderDetailData,
  OrderMakingBoardData,
  OrderWindowData,
} from '@dextea/constraints'

export interface OrderGatewayRequest {
  storeId: number
  authToken: string | undefined
}

export interface OrderGateway {
  getOrderWindow(request: OrderGatewayRequest): Promise<OrderWindowData>
  getMakingBoard(request: OrderGatewayRequest): Promise<OrderMakingBoardData>
  getOrderDetail(request: OrderGatewayRequest, orderId: number): Promise<OrderDetailData>
  markOrderReady(request: OrderGatewayRequest, orderId: number): Promise<null>
  markOrderCollected(request: OrderGatewayRequest, orderId: number): Promise<null>
}
