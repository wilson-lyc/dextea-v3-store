import { useEffect, useMemo, useReducer, useRef, useState } from "react"

import { useScreenEvents, type ScreenEventPayload } from "@/features/screen/hooks/use-screen-events"

interface ScreenSlot {
  number: string
  calledAt: number
}

interface ScreenQueue {
  ready: ScreenSlot[]
  making: string[]
  recent: string[]
}

// 大屏数据由后端 SSE 模拟流驱动（making → ready → collected）
const READY_CAPACITY = 12
const RECENT_CAPACITY = 8

const EMPTY_QUEUE: ScreenQueue = { ready: [], making: [], recent: [] }

function moveToRecent(recent: string[], numbers: string[]): string[] {
  return [...recent, ...numbers].slice(-RECENT_CAPACITY)
}

function queueReducer(state: ScreenQueue, event: ScreenEventPayload): ScreenQueue {
  switch (event.type) {
    case "snapshot": {
      return {
        ready: (event.ready ?? []).map((number) => ({ number, calledAt: Date.now() })),
        making: event.making ?? [],
        recent: [],
      }
    }
    case "making": {
      const { number } = event
      if (!number || state.making.includes(number)) return state
      return { ...state, making: [...state.making, number] }
    }
    case "ready": {
      const { number } = event
      if (!number) return state
      const ready = [...state.ready, { number, calledAt: Date.now() }]
      const overflow = ready.length > READY_CAPACITY ? ready.slice(0, ready.length - READY_CAPACITY) : []
      return {
        making: state.making.filter((item) => item !== number),
        ready: ready.slice(-READY_CAPACITY),
        recent: moveToRecent(state.recent, overflow.map((slot) => slot.number)),
      }
    }
    case "collected": {
      const { number } = event
      if (!number) return state
      return {
        ...state,
        ready: state.ready.filter((slot) => slot.number !== number),
        recent: moveToRecent(state.recent, [number]),
      }
    }
    default:
      return state
  }
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
  const connection = useScreenEvents(dispatch)

  const latest = queue.ready.at(-1) ?? null
  const waiting = useMemo(() => queue.ready.slice(0, -1).reverse(), [queue.ready])
  const { making } = queue

  // 制作中 chip 溢出宽度时启用跑马灯，速度随内容长度自适应（约 80px/s）
  const makingTrackRef = useRef<HTMLDivElement>(null)
  const [marquee, setMarquee] = useState(false)
  const [marqueeDuration, setMarqueeDuration] = useState(18)

  useEffect(() => {
    const track = makingTrackRef.current
    if (!track) return

    const check = () => {
      const inner = track.firstElementChild
      if (!inner) {
        setMarquee(false)
        return
      }
      // 跑马灯模式下内容会复制成两组，取第一组的宽度
      const width = inner.firstElementChild?.scrollWidth ?? inner.scrollWidth
      const overflow = inner.scrollWidth > track.clientWidth
      setMarquee(overflow)
      if (overflow) {
        setMarqueeDuration(Math.max(Math.round(width / 80), 10))
      }
    }
    check()

    const observer = new ResizeObserver(check)
    observer.observe(track)
    return () => observer.disconnect()
  }, [making])

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

      {/* 底栏：制作中队列 + 时间（内容溢出时无缝跑马灯滚动） */}
      <footer className="flex shrink-0 items-center gap-[1.5vw] px-[2vw] py-[1.4vh]">
        <SectionTitle>制作中</SectionTitle>
        <div ref={makingTrackRef} className="min-w-0 flex-1 overflow-hidden">
          {making.length === 0 ? (
            <span
              className="text-neutral-500"
              style={{ fontSize: "clamp(13px, 1.2vw, 22px)" }}
            >
              全部制作完成
            </span>
          ) : marquee ? (
            <div
              className="flex w-max"
              style={{ animation: `screen-marquee ${marqueeDuration}s linear infinite` }}
            >
              {[0, 1].map((group) => (
                <div
                  key={group}
                  className="flex gap-[0.9vw]"
                  style={{ paddingInlineEnd: "0.9vw" }}
                  aria-hidden={group === 1}
                >
                  {making.map((number, index) => (
                    <MakingChip key={`${group}-${number}`} number={number} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-[0.9vw] gap-y-[0.6vh]">
              {making.map((number, index) => (
                <MakingChip key={number} number={number} />
              ))}
            </div>
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
        @keyframes screen-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
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

function MakingChip({ number }: { number: string }) {
  return (
    <span
      className="tabular-nums font-medium text-black"
      style={{ fontSize: "clamp(13px, 1.3vw, 24px)" }}
    >
      {number}
    </span>
  )
}
