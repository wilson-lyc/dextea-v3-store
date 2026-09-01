import { useEffect, useRef, useState } from "react"

import { apiRoutes, storeEventTypes, type StoreEvent } from "@dextea/constraints"

import { getToken } from "@/features/auth/session"
import { API_BASE_URL } from "@/shared/api/client"
import { logger } from "@/shared/lib/logger"

export type StoreEventConnection = "connecting" | "live" | "offline"

const EVENT_TYPES = [storeEventTypes.SNAPSHOT, storeEventTypes.ORDER_STATUS]

export function useStoreEvents(
  onEvent: (event: StoreEvent) => void,
  onLive?: () => void,
): StoreEventConnection {
  const [connection, setConnection] = useState<StoreEventConnection>("connecting")
  const handlerRef = useRef(onEvent)
  const onLiveRef = useRef(onLive)

  useEffect(() => {
    handlerRef.current = onEvent
    onLiveRef.current = onLive
  })

  useEffect(() => {
    const token = getToken()
    const query = token ? `?token=${encodeURIComponent(token)}` : ""
    const source = new EventSource(`${API_BASE_URL}${apiRoutes.store.events()}${query}`)
    let reconnecting = false

    const handle = (event: MessageEvent) => {
      try {
        handlerRef.current(JSON.parse(event.data) as StoreEvent)
      } catch {
        logger.warn("[事件流] 忽略无法解析的事件", event.data)
      }
    }
    for (const type of EVENT_TYPES) {
      source.addEventListener(type, handle)
    }

    source.onopen = () => {
      setConnection("live")
      if (reconnecting) {
        reconnecting = false
        onLiveRef.current?.()
      }
    }
    source.onerror = () => {
      reconnecting = true
      setConnection("offline")
    }

    return () => source.close()
  }, [])

  return connection
}
