import { OrderMakingStatus, OrderPaymentStatus } from "@dextea/constraints"

import {
  fetchOrderDetail,
  fetchOrderWindow,
  type OrderWindowItem,
} from "@/lib/api/orders"

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  note?: string
  coverUrl?: string | null
  customization?: string | null
}

export interface Order {
  id: string
  orderNo: string
  code: string
  customer: string
  type: "堂食" | "外带" | "外卖"
  paymentStatus: number
  makingStatus: number
  items: OrderItem[]
  total: number
  createdAt: string
}

export const PAID_PAYMENT_STATUS = OrderPaymentStatus.keyMap.PAID

export function getOrderStatus(order: Order): string {
  if (order.paymentStatus !== PAID_PAYMENT_STATUS) {
    return OrderPaymentStatus.getItemByValue(order.paymentStatus)!.label
  }
  return OrderMakingStatus.getItemByValue(order.makingStatus)!.label
}

function mapDiningType(diningMethod: number): Order["type"] {
  switch (diningMethod) {
    case 1:
      return "堂食"
    case 3:
      return "外卖"
    default:
      return "外带"
  }
}

function formatCreatedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function mapOrderWindowItem(item: OrderWindowItem): Order {
  return {
    id: String(item.orderId),
    orderNo: item.orderNo,
    code: item.pickupCode,
    customer: mapDiningType(item.diningMethod) === "外卖" ? "外卖订单" : "门店订单",
    type: mapDiningType(item.diningMethod),
    paymentStatus: item.paymentStatus,
    makingStatus: item.makingStatus,
    items: [
      {
        id: String(item.orderId),
        name: "订单商品",
        price: item.totalPrice,
        quantity: item.totalQuantity,
      },
    ],
    total: item.totalPrice,
    createdAt: formatCreatedAt(item.createdAt),
  }
}

export async function getOrderWindow(): Promise<Order[]> {
  const result = await fetchOrderWindow()
  return result.items.map(mapOrderWindowItem)
}

export async function getOrderDetail(orderId: number): Promise<Order> {
  const detail = await fetchOrderDetail(orderId)
  return {
    id: String(detail.id),
    orderNo: detail.orderNo,
    code: detail.pickupCode,
    customer: mapDiningType(detail.diningMethod) === "外卖" ? "外卖订单" : "门店订单",
    type: mapDiningType(detail.diningMethod),
    paymentStatus: detail.paymentStatus,
    makingStatus: detail.makingStatus,
    items: detail.items.map((item) => ({
      id: item.id != null ? String(item.id) : `${item.productId}-${item.skuId}`,
      name: item.productName,
      price: item.unitPrice,
      quantity: item.quantity,
      note: detail.note ?? undefined,
      coverUrl: item.coverUrl,
      customization: item.customization,
    })),
    total: detail.totalPrice,
    createdAt: formatCreatedAt(detail.createdAt),
  }
}

export const storeName = "德贤茶 · 中心广场店"
