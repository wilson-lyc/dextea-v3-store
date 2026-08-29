import { cn } from "@/shared/lib/cn"
import { getOrderStatusLabel, getOrderStatusStyle, type Order } from "@/features/order/model"

interface OrderStatusBadgeProps {
  order: Order
  className?: string
}

export function OrderStatusBadge({ order, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[11px] font-medium",
        getOrderStatusStyle(order),
        className,
      )}
    >
      {getOrderStatusLabel(order)}
    </span>
  )
}
