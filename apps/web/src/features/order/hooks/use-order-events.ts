import { useEffect, useRef, useState } from "react"

import { apiRoutes } from "@dextea/constraints"

import { getToken } from "@/features/auth/session"
import { API_BASE_URL } from "@/shared/api/client"
import { mapOrderStatusEvent, type Order } from "@/features/order/model"

export type OrderEventConnection = "connecting" | "live" | "offline"

/**
 * 订阅门店订单 SSE 事件流（/api/v1/store/orders/events），
 * 收到 new-order 事件（MQ tag=PENDING_TO_PREPARING 透传）后
 * 把新订单卡片插到列表最前面；若订单已存在则原地更新，不重复插入。
 * 断线后由 EventSource 自动重连，重连成功会触发 onLive 供页面刷新列表。
 */
export function useOrderEvents(
  setOrders: (updater: (prev: Order[]) => Order[]) => void,
  onLive?: () => void,
): OrderEventConnection {
  const [connection, setConnection] = useState<OrderEventConnection>("connecting")
  const setOrdersRef = useRef(setOrders)
  const onLiveRef = useRef(onLive)

  useEffect(() => {
    setOrdersRef.current = setOrders
    onLiveRef.current = onLive
  })

  useEffect(() => {
    // EventSource 无法携带 Authorization 头，token 走查询参数
    const token = getToken()
    const query = token ? `?token=${encodeURIComponent(token)}` : ""
    const source = new EventSource(
      `${API_BASE_URL}${apiRoutes.order.events()}${query}`,
    )
    // 断线期间可能漏掉新订单，重连成功后刷新一次列表兜底
    let reconnecting = false

    source.addEventListener("new-order", (event: MessageEvent) => {
      try {
        const order = mapOrderStatusEvent(JSON.parse(event.data))
        setOrdersRef.current((prev) => {
          const existing = prev.findIndex((item) => item.id === order.id)
          if (existing === -1) return [order, ...prev]
          const next = [...prev]
          next[existing] = order
          return next
        })
      } catch {
        // 忽略无法解析的事件
      }
    })

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
