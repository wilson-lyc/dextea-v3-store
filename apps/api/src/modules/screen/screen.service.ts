export type ScreenEventType = 'snapshot' | 'making' | 'ready' | 'collected'

export interface ScreenEvent {
  type: ScreenEventType
  /** 制作中 / 待取餐 / 刚被取走的取餐码（snapshot 事件无此字段） */
  number?: string
  ready?: string[]
  making?: string[]
}

interface ScreenSimulatorState {
  making: string[]
  ready: string[]
  /** 下一个取餐号序号（8xxx 格式） */
  nextSeq: number
}

const MAX_MAKING = 6
const MAX_READY = 10
const TICK_MIN_MS = 2_500
const TICK_MAX_MS = 6_500

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function formatNumber(seq: number): string {
  return `8${seq.toString().padStart(3, '0')}`
}

/**
 * 大屏事件模拟器：内存中维护制作/待取餐队列，
 * 按随机间隔生成 making → ready → collected 事件流，用于联调与演示。
 */
export class ScreenSimulator {
  private state: ScreenSimulatorState = { making: [], ready: [], nextSeq: 1 }
  private subscribers = new Set<(event: ScreenEvent) => void>()
  private timer: NodeJS.Timeout | null = null

  public subscribe(listener: (event: ScreenEvent) => void): () => void {
    this.subscribers.add(listener)
    if (!this.timer) {
      this.scheduleNextTick()
    }
    return () => {
      this.subscribers.delete(listener)
      if (this.subscribers.size === 0 && this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    }
  }

  public currentSnapshot(): ScreenEvent {
    return { type: 'snapshot', ready: [...this.state.ready], making: [...this.state.making] }
  }

  private scheduleNextTick(): void {
    this.timer = setTimeout(() => {
      this.timer = null
      this.tick()
      if (this.subscribers.size > 0) {
        this.scheduleNextTick()
      }
    }, randomBetween(TICK_MIN_MS, TICK_MAX_MS))
  }

  private tick(): void {
    const { making, ready } = this.state
    const actions: Array<() => ScreenEvent> = []

    if (making.length < MAX_MAKING) {
      actions.push(() => {
        const seq = this.state.nextSeq + 1 + Math.floor(Math.random() * 3)
        this.state.nextSeq = seq
        const number = formatNumber(seq)
        this.state.making = [...this.state.making, number]
        return { type: 'making', number }
      })
    }
    if (making.length > 0 && ready.length < MAX_READY) {
      actions.push(() => {
        const number = this.state.making[0]!
        this.state.making = this.state.making.slice(1)
        this.state.ready = [...this.state.ready, number]
        return { type: 'ready', number }
      })
    }
    if (ready.length > 2) {
      actions.push(() => {
        const number = this.state.ready[0]!
        this.state.ready = this.state.ready.slice(1)
        return { type: 'collected', number }
      })
    }

    if (actions.length === 0) return
    const emit = actions[Math.floor(Math.random() * actions.length)]!
    this.publish(emit())
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
