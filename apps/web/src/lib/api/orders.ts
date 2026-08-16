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
  id: number | null
  productId: number
  productName: string
  skuId: string
  customization: string | null
  coverUrl: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  available: boolean
}

export interface OrderDetailData {
  id: number
  orderNo: string
  tradeNo: string
  storeId: number
  diningMethod: number
  note: string | null
  source: number
  pickupCode: string
  makingStatus: number
  paymentMethod: number
  paymentStatus: number
  paymentExpiredAt: string | null
  paymentPaidAt: string | null
  paymentRefundedAt: string | null
  createdAt: string
  updatedAt: string
  totalPrice: number
  totalQuantity: number
  items: OrderDetailItem[]
}

export async function fetchOrderWindow(): Promise<OrderWindowResult> {
  return http.get<OrderWindowResult>("/api/v1/store/orders/window")
}

export async function fetchOrderDetail(orderId: number): Promise<OrderDetailData> {
  return http.get<OrderDetailData>(`/api/v1/store/orders/${orderId}`)
}
