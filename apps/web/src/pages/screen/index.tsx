import { useEffect, useMemo, useReducer, useState } from "react"

import {
  orderMakingEventTags,
  storeEventTypes,
  type OrderMakingBoardData,
  type StoreEvent,
} from "@dextea/constraints"

import { fetchMakingBoard } from "@/features/order/api"
import { useStoreEvents } from "@/features/store-event/hooks/use-store-events"
import { logger } from "@/shared/lib/logger"

interface ScreenSlot {
  number: string
  calledAt: number
}

interface ScreenQueue {
  ready: ScreenSlot[]
  recent: string[]
  making: string[]
  preparingOrderCount: number
  preparingProductQuantity: number
  boardSynced: boolean
}

// 看板为权威全量，SSE 事件只做秒级增量；轮询用于对账，修正丢事件 / 重启导致的漂移
type ScreenAction = StoreEvent | { type: "board"; board: OrderMakingBoardData }

const READY_CAPACITY = 12
const RECENT_CAPACITY = 8
const MAKING_CAPACITY = 12
const BOARD_POLL_INTERVAL_MS = 30_000

const EMPTY_QUEUE: ScreenQueue = {
  ready: [],
  recent: [],
  making: [],
  preparingOrderCount: 0,
  preparingProductQuantity: 0,
  boardSynced: false,
}

function moveToRecent(recent: string[], numbers: string[]): string[] {
  return [...recent, ...numbers].slice(-RECENT_CAPACITY)
}

// 用权威取餐码列表重建队列，已在屏上的保留原叫号时间，避免叫号动画被无意义重置
function syncSlots(previous: ScreenSlot[], numbers: string[]): ScreenSlot[] {
  const calledAtByNumber = new Map(previous.map((slot) => [slot.number, slot.calledAt]))
  return numbers.map((number) => ({
    number,
    calledAt: calledAtByNumber.get(number) ?? Date.now(),
  }))
}

function queueReducer(state: ScreenQueue, action: ScreenAction): ScreenQueue {
  if (action.type === "board") {
    const {
      preparingPickupCodes,
      readyPickupCodes,
      preparingOrderCount,
      preparingProductQuantity,
    } = action.board

    return {
      ready: syncSlots(state.ready, readyPickupCodes).slice(-READY_CAPACITY),
      recent: state.recent,
      making: preparingPickupCodes.slice(-MAKING_CAPACITY),
      preparingOrderCount,
      preparingProductQuantity,
      boardSynced: true,
    }
  }

  if (action.type === storeEventTypes.SNAPSHOT) {
    return {
      ...state,
      ready: syncSlots(state.ready, action.ready).slice(-READY_CAPACITY),
      recent: [],
      making: action.making.slice(-MAKING_CAPACITY),
    }
  }

  if (action.tag === orderMakingEventTags.PENDING_TO_PREPARING) {
    const { pickupCode } = action
    if (!pickupCode || state.making.includes(pickupCode)) return state
    return { ...state, making: [...state.making, pickupCode].slice(-MAKING_CAPACITY) }
  }

  if (action.tag === orderMakingEventTags.PREPARING_TO_READY) {
    const { pickupCode } = action
    const making = pickupCode
      ? state.making.filter((code) => code !== pickupCode)
      : state.making
    if (!pickupCode || state.ready.some((slot) => slot.number === pickupCode)) {
      return { ...state, making }
    }
    const ready = [...state.ready, { number: pickupCode, calledAt: Date.now() }]
    const overflow = ready.length > READY_CAPACITY ? ready.slice(0, ready.length - READY_CAPACITY) : []
    return {
      ...state,
      ready: ready.slice(-READY_CAPACITY),
      recent: moveToRecent(state.recent, overflow.map((slot) => slot.number)),
      making,
    }
  }

  return state
}

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])
  return now
}

export default function ScreenPage() {
  const now = useNow()
  const [queue, dispatch] = useReducer(queueReducer, EMPTY_QUEUE)
  const connection = useStoreEvents(dispatch)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const board = await fetchMakingBoard()
        if (cancelled) return
        dispatch({ type: "board", board })
      } catch (error) {
        logger.error("[大屏] 制作看板拉取失败", error)
      }
    }

    void load()
    const timer = window.setInterval(load, BOARD_POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const latest = queue.ready.at(-1) ?? null
  const waiting = useMemo(() => queue.ready.slice(0, -1).reverse(), [queue.ready])

  const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][now.getDay()]
  const dateText = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekday}`
  const timeText = `${pad(now.getHours())}:${pad(now.getMinutes())}`

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-white text-black">
      {/* 主体：左侧当前叫号，右侧待取餐网格 */}
      <main
        className="grid min-h-0 flex-1 grid-cols-[1fr_1.5fr] px-[2vw] py-[2.2vh]"
        style={{ borderBottom: "1px solid oklch(0.9 0 0)" }}
      >
        <section
          className="flex min-h-0 flex-col pr-[2.5vw]"
          style={{ borderRight: "1px solid oklch(0.9 0 0)" }}
        >
          <SectionTitle>现在请取餐</SectionTitle>
          {latest ? (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <span
                key={latest.number}
                className="font-bold tabular-nums leading-none text-black"
                style={{
                  fontSize: "clamp(80px, 14vw, 260px)",
                  letterSpacing: "-0.02em",
                  animation: "screen-enter 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {latest.number}
              </span>
            </div>
          ) : (
            <div
              className="flex flex-1 items-center justify-center text-neutral-500"
              style={{ fontSize: "clamp(18px, 1.8vw, 34px)" }}
            >
              {connection === "live" ? "暂无叫号" : "正在连接服务"}
            </div>
          )}
        </section>

        <section className="flex min-h-0 flex-col pl-[2.5vw]">
          <SectionTitle>待取餐</SectionTitle>
          <div
            className="grid grid-cols-3 content-start gap-[1vw]"
            style={{ gridAutoRows: "clamp(80px, 16vh, 180px)", paddingTop: "1.2vh" }}
          >
            {waiting.length === 0 ? (
              <div
                className="col-span-3 flex items-center justify-center text-neutral-500"
                style={{ fontSize: "clamp(18px, 1.8vw, 34px)" }}
              >
                暂无待取餐订单
              </div>
            ) : (
              waiting.map((slot) => (
                <div
                  key={slot.number}
                  className="flex items-center justify-center font-medium tabular-nums text-black"
                  style={{
                    fontSize: "clamp(26px, 3.2vw, 64px)",
                  }}
                >
                  {slot.number}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* 底栏：制作中队列 + 时间 */}
      <footer className="flex shrink-0 items-center gap-[1.5vw] px-[2vw] py-[1.4vh]">
        <SectionTitle>制作中</SectionTitle>

        {queue.boardSynced && (
          <span
            className="shrink-0 tabular-nums text-[oklch(0.45 0 0)]"
            style={{ fontSize: "clamp(13px, 1.2vw, 22px)" }}
          >
            共 {queue.preparingOrderCount} 单 / {queue.preparingProductQuantity} 件
          </span>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-[1.2vw] overflow-hidden">
          {queue.making.length === 0 ? (
            <span
              className="text-neutral-500"
              style={{ fontSize: "clamp(13px, 1.2vw, 22px)" }}
            >
              {connection === "live" ? "暂无制作中订单" : "正在连接服务"}
            </span>
          ) : (
            queue.making.map((number) => (
              <span
                key={number}
                className="font-medium tabular-nums text-black"
                style={{ fontSize: "clamp(20px, 2.2vw, 42px)" }}
              >
                {number}
              </span>
            ))
          )}
        </div>

        <div className="flex shrink-0 items-baseline gap-[0.9vw]">
          {connection !== "live" && (
            <span
              className="inline-block self-center rounded-full"
              style={{
                width: "clamp(8px, 0.7vw, 14px)",
                height: "clamp(8px, 0.7vw, 14px)",
                background: "oklch(0.6 0.19 25)",
                animation: "screen-pulse 1.6s ease-in-out infinite",
              }}
            />
          )}
          <span
            className="font-medium text-[oklch(0.45 0 0)]"
            style={{ fontSize: "clamp(13px, 1.2vw, 22px)" }}
          >
            {dateText}
          </span>
          <span
            className="font-bold tabular-nums leading-none text-black"
            style={{ fontSize: "clamp(20px, 2.2vw, 42px)", letterSpacing: "0.02em" }}
          >
            {timeText}
          </span>
        </div>
      </footer>

      <style>{`
        @keyframes screen-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        @keyframes screen-enter {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="shrink-0 font-medium text-black"
      style={{
        fontSize: "clamp(13px, 1.2vw, 24px)",
        letterSpacing: "0.35em",
      }}
    >
      {children}
    </h2>
  )
}
