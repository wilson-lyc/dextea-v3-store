import {
  storeEventTypes,
  type OrderStatusEvent,
  type StoreEvent,
} from '@dextea/constraints'
import { getLogger } from '@/shared/logger.js'

export type StoreEventListener = (event: StoreEvent) => void

// 门店事件总线只做 MQ → SSE 的无状态扇出。
// 制作中 / 待取餐队列的权威数据在订单微服务，由前端调用制作看板接口获取并轮询对账，
// 本服务不持有任何业务状态，避免重启丢数据、多实例状态不一致。
export class StoreEventHub {
  private subscribers = new Map<number, Set<StoreEventListener>>()

  subscribe(storeId: number, listener: StoreEventListener): () => void {
    this.listenersOf(storeId).add(listener)
    return () => this.unsubscribe(storeId, listener)
  }

  publish(event: OrderStatusEvent): void {
    this.dispatch(event.storeId, { ...event, type: storeEventTypes.ORDER_STATUS })
  }

  private listenersOf(storeId: number): Set<StoreEventListener> {
    let listeners = this.subscribers.get(storeId)
    if (!listeners) {
      listeners = new Set()
      this.subscribers.set(storeId, listeners)
    }
    return listeners
  }

  private unsubscribe(storeId: number, listener: StoreEventListener): void {
    const listeners = this.subscribers.get(storeId)
    if (!listeners) return

    listeners.delete(listener)
    if (listeners.size === 0) {
      this.subscribers.delete(storeId)
    }
  }

  private dispatch(storeId: number, event: StoreEvent): void {
    const listeners = this.subscribers.get(storeId)
    if (!listeners || listeners.size === 0) return

    const log = getLogger()
    for (const listener of listeners) {
      try {
        listener(event)
      } catch (error) {
        log.warn({ error }, `[store-event] 推送事件失败 (storeId=${storeId})`)
      }
    }
  }
}

export const storeEventHub = new StoreEventHub()
