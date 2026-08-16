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

export interface OrderDetailItem {
  skuId: number
  name: string
  spec?: string
  price: number
  quantity: number
  note?: string
}

export interface OrderDetailData {
  orderId: number
  orderNo: string
  pickupCode: string
  totalPrice: number
  totalQuantity: number
  diningMethod: number
  makingStatus: number
  paymentStatus: number
  createdAt: string
  items: OrderDetailItem[]
}

export async function fetchOrderWindow(): Promise<OrderWindowResult> {
  return http.get<OrderWindowResult>("/api/v1/store/orders/window")
}

export async function fetchOrderDetail(orderId: number): Promise<OrderDetailData> {
  return http.get<OrderDetailData>(`/api/v1/store/orders/${orderId}`)
}
