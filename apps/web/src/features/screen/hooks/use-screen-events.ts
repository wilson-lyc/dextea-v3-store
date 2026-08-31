import { useEffect, useRef, useState } from "react"

import { apiRoutes } from "@dextea/constraints"

import { getToken } from "@/features/auth/session"
import { API_BASE_URL } from "@/shared/api/client"

export type ScreenEventType = "snapshot" | "making" | "ready" | "collected"

export interface ScreenEventPayload {
  type: ScreenEventType
  number?: string
  ready?: string[]
  making?: string[]
}

export type ScreenConnection = "connecting" | "live" | "offline"

const EVENT_TYPES: ScreenEventType[] = ["snapshot", "making", "ready", "collected"]

/**
 * 订阅服务大屏 SSE 事件流（/api/v1/screen/events），
 * 断线后由 EventSource 自动重连，重连成功会收到 snapshot 全量事件。
 */
export function useScreenEvents(
  onEvent: (event: ScreenEventPayload) => void,
): ScreenConnection {
  const [connection, setConnection] = useState<ScreenConnection>("connecting")
  const handlerRef = useRef(onEvent)

  useEffect(() => {
    handlerRef.current = onEvent
  })

  useEffect(() => {
    // EventSource 无法携带 Authorization 头，token 走查询参数
    const token = getToken()
    const query = token ? `?token=${encodeURIComponent(token)}` : ""
    const source = new EventSource(`${API_BASE_URL}${apiRoutes.screen.events()}${query}`)

    const handle = (event: MessageEvent) => {
      try {
        handlerRef.current(JSON.parse(event.data) as ScreenEventPayload)
      } catch {
        // 忽略无法解析的事件
      }
    }
    for (const type of EVENT_TYPES) {
      source.addEventListener(type, handle)
    }

    source.onopen = () => setConnection("live")
    source.onerror = () => setConnection("offline")

    return () => source.close()
  }, [])

  return connection
}
