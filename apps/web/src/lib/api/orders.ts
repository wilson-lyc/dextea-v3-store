import { http } from "./request"

export interface OrderWindowItem {
  orderId: number
  orderNo: string
  pickupCode: string
  totalPrice: number
  totalQuantity: number
  diningMethod: number
  makingStatus: number
  paymentStatus: number
  createdAt: string
}

export interface OrderWindowResult {
  items: OrderWindowItem[]
  total: number
}

export async function fetchOrderWindow(): Promise<OrderWindowResult> {
  return http.get<OrderWindowResult>("/api/v1/store/orders/window")
}
