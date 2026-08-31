import { getLogger } from '@/shared/logger.js'

/**
 * 订单状态变更消息（来自订单微服务的 MQ 消息，tag=PENDING_TO_PREPARING）。
 * 字段与 MQ 消息体一一对应，直接透传给前端，无需查库。
 */
export interface OrderStatusEvent {
  orderId: number
  orderNo: string
  storeId: number
  fromStatus: number
  toStatus: number
  makingStatus: number
  paymentStatus: number
  pickupCode: string
  totalPrice: number
  totalQuantity: number
  createdAt: string
}

export type OrderEventListener = (event: OrderStatusEvent) => void

/**
 * 按门店分组的 SSE 订阅注册表（内存级，连接断开即注销）。
 * MQ 消费者收到 PENDING_TO_PREPARING 后按 storeId 广播。
 */
export class OrderEventHub {
  private subscribers = new Map<number, Set<OrderEventListener>>()

  subscribe(storeId: number, listener: OrderEventListener): () => void {
    let listeners = this.subscribers.get(storeId)
    if (!listeners) {
      listeners = new Set()
      this.subscribers.set(storeId, listeners)
    }
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.subscribers.delete(storeId)
      }
    }
  }

  publish(storeId: number, event: OrderStatusEvent): void {
    const listeners = this.subscribers.get(storeId)
    if (!listeners || listeners.size === 0) return

    const log = getLogger()
    for (const listener of listeners) {
      try {
        listener(event)
      } catch (error) {
        log.warn({ error }, `[order-events] 推送事件失败 (orderNo=${event.orderNo})`)
      }
    }
  }
}

export const orderEventHub = new OrderEventHub()
