import {
  orderMakingEventTags,
  storeEventTypes,
  type OrderStatusEvent,
  type StoreEvent,
} from '@dextea/constraints'
import { getLogger } from '@/shared/logger.js'

export type StoreEventListener = (event: StoreEvent) => void

const MAX_READY = 30
const MAX_MAKING = 30

export class StoreEventHub {
  private subscribers = new Map<number, Set<StoreEventListener>>()
  private readyByStore = new Map<number, string[]>()
  private makingByStore = new Map<number, string[]>()

  subscribe(storeId: number, listener: StoreEventListener): () => void {
    this.listenersOf(storeId).add(listener)
    return () => this.unsubscribe(storeId, listener)
  }

  snapshot(storeId: number): StoreEvent {
    return {
      type: storeEventTypes.SNAPSHOT,
      ready: [...(this.readyByStore.get(storeId) ?? [])],
      making: [...(this.makingByStore.get(storeId) ?? [])],
    }
  }

  publish(event: OrderStatusEvent): void {
    if (event.tag === orderMakingEventTags.PENDING_TO_PREPARING) {
      this.markMaking(event.storeId, event.pickupCode)
    }
    if (event.tag === orderMakingEventTags.PREPARING_TO_READY) {
      this.unmarkMaking(event.storeId, event.pickupCode)
      this.markReady(event.storeId, event.pickupCode)
    }
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

  private markReady(storeId: number, pickupCode: string): void {
    const ready = this.readyByStore.get(storeId) ?? []
    if (ready.includes(pickupCode)) return
    this.readyByStore.set(storeId, [...ready, pickupCode].slice(-MAX_READY))
  }

  private markMaking(storeId: number, pickupCode: string): void {
    if (!pickupCode) return
    const making = this.makingByStore.get(storeId) ?? []
    if (making.includes(pickupCode)) return
    this.makingByStore.set(storeId, [...making, pickupCode].slice(-MAX_MAKING))
  }

  private unmarkMaking(storeId: number, pickupCode: string): void {
    if (!pickupCode) return
    const making = this.makingByStore.get(storeId)
    if (!making) return

    const next = making.filter((number) => number !== pickupCode)
    if (next.length === making.length) return
    if (next.length === 0) {
      this.makingByStore.delete(storeId)
      return
    }
    this.makingByStore.set(storeId, next)
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
