import {
  OrderDiningMethod,
  OrderMakingStatus,
  OrderPaymentStatus,
  type OrderDetailData,
  type OrderWindowItem,
} from "@dextea/constraints"

import { formatDateTime } from "@/shared/lib/datetime"

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  note?: string
  coverUrl?: string | null
  customization?: string | null
}

export type DiningMethodLabel = "堂食" | "外带" | "外卖"

export interface Order {
  id: string
  orderNo: string
  code: string
  customer: string
  type: DiningMethodLabel
  paymentStatus: number
  makingStatus: number
  items: OrderItem[]
  total: number
  createdAt: string
}

export type OrderTabKey = number | "all"

export interface OrderTab {
  key: OrderTabKey
  label: string
}

export interface OrderCounts {
  all: number
  byMakingStatus: Record<number, number>
}

export interface OrderAction {
  label: string
  action: "start" | "ready" | "collect"
  icon: "loader" | "check" | "none"
  disabled: boolean
}

export const WAIT_WARNING_MINUTES = 15

export const ORDER_TABS: readonly OrderTab[] = [
  { key: "all", label: "全部" },
  { key: OrderMakingStatus.keyMap.PREPARING, label: "制作中" },
  { key: OrderMakingStatus.keyMap.READY, label: "待取餐" },
]

const COUNTER_VISIBLE_MAKING_STATUS = new Set<number>([
  OrderMakingStatus.keyMap.PREPARING,
  OrderMakingStatus.keyMap.READY,
])

const MAKING_STATUS_STYLES: Record<number, string> = {
  [OrderMakingStatus.keyMap.PENDING]:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  [OrderMakingStatus.keyMap.PREPARING]:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  [OrderMakingStatus.keyMap.READY]: "",
  [OrderMakingStatus.keyMap.COLLECTED]: "",
}

const PAYMENT_STATUS_STYLES: Record<number, string> = {
  [OrderPaymentStatus.keyMap.PENDING]:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  [OrderPaymentStatus.keyMap.TIMEOUT]:
    "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  [OrderPaymentStatus.keyMap.PAID]: "",
  [OrderPaymentStatus.keyMap.REFUNDING]:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  [OrderPaymentStatus.keyMap.REFUNDED]: "bg-muted text-muted-foreground",
}

const ORDER_ACTIONS: Record<number, OrderAction> = {
  [OrderMakingStatus.keyMap.PENDING]: {
    label: "开始制作",
    action: "start",
    icon: "loader",
    disabled: false,
  },
  [OrderMakingStatus.keyMap.PREPARING]: {
    label: "完成制作",
    action: "ready",
    icon: "check",
    disabled: false,
  },
  [OrderMakingStatus.keyMap.READY]: {
    label: "确认取餐",
    action: "collect",
    icon: "check",
    disabled: false,
  },
  [OrderMakingStatus.keyMap.COLLECTED]: {
    label: "已完成",
    action: "collect",
    icon: "none",
    disabled: true,
  },
}

function mapDiningMethod(diningMethod: number): DiningMethodLabel {
  const key = OrderDiningMethod.getKeyByValue(diningMethod)
  if (key === "DINE_IN") return "堂食"
  if (key === "TAKEAWAY_DELIVERY") return "外卖"
  return "外带"
}

export function isCounterVisible(order: Order): boolean {
  return (
    order.paymentStatus === OrderPaymentStatus.keyMap.PAID &&
    COUNTER_VISIBLE_MAKING_STATUS.has(order.makingStatus)
  )
}

export function getOrderStatusLabel(order: Order): string {
  if (order.paymentStatus !== OrderPaymentStatus.keyMap.PAID) {
    return OrderPaymentStatus.getLabel(order.paymentStatus)
  }
  return OrderMakingStatus.getLabel(order.makingStatus)
}

export function getOrderStatusStyle(order: Order): string {
  if (order.paymentStatus === OrderPaymentStatus.keyMap.PAID) {
    return MAKING_STATUS_STYLES[order.makingStatus] ?? ""
  }
  return PAYMENT_STATUS_STYLES[order.paymentStatus] ?? ""
}

export function nextOrderAction(order: Order): OrderAction | null {
  if (order.paymentStatus !== OrderPaymentStatus.keyMap.PAID) return null
  return ORDER_ACTIONS[order.makingStatus] ?? null
}

export function countOrders(orders: Order[]): OrderCounts {
  const byMakingStatus: Record<number, number> = {}
  for (const order of orders) {
    byMakingStatus[order.makingStatus] = (byMakingStatus[order.makingStatus] ?? 0) + 1
  }
  return { all: orders.length, byMakingStatus }
}

export function mapOrderWindowItem(item: OrderWindowItem): Order {
  const type = mapDiningMethod(item.diningMethod)

  return {
    id: String(item.orderId),
    orderNo: item.orderNo,
    code: item.pickupCode,
    customer: type === "外卖" ? "外卖订单" : "门店订单",
    type,
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
    createdAt: formatDateTime(item.createdAt),
  }
}

export function mapOrderDetail(detail: OrderDetailData): Order {
  const type = mapDiningMethod(detail.diningMethod)

  return {
    id: String(detail.id),
    orderNo: detail.orderNo,
    code: detail.pickupCode,
    customer: type === "外卖" ? "外卖订单" : "门店订单",
    type,
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
    createdAt: formatDateTime(detail.createdAt),
  }
}
