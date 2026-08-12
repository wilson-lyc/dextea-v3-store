import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

import { getOrderStatus, type Order } from "../data"
import { OrderStatusBadge } from "./OrderStatusBadge"

interface OrderCardProps {
  order: Order
  selected: boolean
  onSelect: (id: string) => void
}

function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}

function getWaitMinutes(createdAt: string, now: number) {
  const ordered = new Date(createdAt.replace(" ", "T"))
  return Math.max(0, Math.floor((now - ordered.getTime()) / 60000))
}

export function OrderCard({ order, selected, onSelect }: OrderCardProps) {
  const now = useNow()
  const totalQuantity = order.items.reduce((sum, i) => sum + i.quantity, 0)
  const waitMinutes = getWaitMinutes(order.createdAt, now)
  const waiting = waitMinutes > 15

  return (
    <button
      type="button"
      onClick={() => onSelect(order.id)}
      className={`flex w-full flex-col gap-2 rounded-xl border bg-background p-3 text-left transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected ? "border-primary ring-1 ring-primary" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-wide">{order.code}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {order.type}
          </span>
        </div>
        <OrderStatusBadge status={getOrderStatus(order)} />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">共 {totalQuantity} 件</span>
        <span className="text-sm font-semibold">¥{order.total}</span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{order.createdAt}</span>
        <span
          className={`flex items-center gap-1 ${waiting ? "font-medium text-rose-500" : ""}`}
        >
          <Clock className="size-3" />
          等待 {waitMinutes} 分钟
        </span>
      </div>
    </button>
  )
}
