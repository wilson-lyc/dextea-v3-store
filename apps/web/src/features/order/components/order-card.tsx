import { Clock } from "lucide-react"

import { cn } from "@/shared/lib/cn"
import { useNow } from "@/shared/hooks/use-now"
import { waitMinutes } from "@/shared/lib/datetime"
import { WAIT_WARNING_MINUTES, type Order } from "@/features/order/model"
import { OrderStatusBadge } from "@/features/order/components/order-status-badge"

interface OrderCardProps {
  order: Order
  selected: boolean
  onSelect: (id: string) => void
}

export function OrderCard({ order, selected, onSelect }: OrderCardProps) {
  const now = useNow()
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const waited = waitMinutes(order.createdAt, now)
  const waiting = waited > WAIT_WARNING_MINUTES

  return (
    <button
      type="button"
      onClick={() => onSelect(order.id)}
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border bg-background p-3 text-left transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-wide">{order.code}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {order.type}
          </span>
        </div>
        <OrderStatusBadge order={order} />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">共 {totalQuantity} 件</span>
        <span className="text-sm font-semibold">¥{order.total}</span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{order.createdAt}</span>
        <span
          className={cn(
            "flex items-center gap-1",
            waiting && "font-medium text-rose-500",
          )}
        >
          <Clock className="size-3" />
          等待 {waited} 分钟
        </span>
      </div>
    </button>
  )
}
