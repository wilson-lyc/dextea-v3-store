export type ScreenEventType = 'snapshot' | 'ready' | 'collected'

export interface ScreenEvent {
  type: ScreenEventType
  /** 待取餐 / 刚被取走的取餐码（snapshot 事件无此字段） */
  number?: string
  ready?: string[]
}

const MAX_READY = 30

/**
 * 大屏事件总线：内存中维护待取餐取餐码列表，
 * MQ 消费者收到出餐消息后调用 publishReady 推送给所有 SSE 订阅者。
 */
export class ScreenEventHub {
  private ready: string[] = []
  private subscribers = new Set<(event: ScreenEvent) => void>()

  public subscribe(listener: (event: ScreenEvent) => void): () => void {
    this.subscribers.add(listener)
    return () => {
      this.subscribers.delete(listener)
    }
  }

  public currentSnapshot(): ScreenEvent {
    return { type: 'snapshot', ready: [...this.ready] }
  }

  /** 出餐：新增一个待取餐取餐码并广播 */
  public publishReady(number: string): void {
    if (!this.ready.includes(number)) {
      // 无 collected 消息源时仅靠容量上限淘汰最旧的取餐码
      this.ready = [...this.ready, number].slice(-MAX_READY)
    }
    this.publish({ type: 'ready', number })
  }

  /** 取餐完成：移除取餐码并广播 */
  public publishCollected(number: string): void {
    this.ready = this.ready.filter((item) => item !== number)
    this.publish({ type: 'collected', number })
  }

  private publish(event: ScreenEvent): void {
    for (const listener of this.subscribers) {
      try {
        listener(event)
      } catch {
        this.subscribers.delete(listener)
      }
    }
  }
}

// 全局单例：SSE 路由与 MQ 消费者共享同一事件源
export const screenEventHub = new ScreenEventHub()
