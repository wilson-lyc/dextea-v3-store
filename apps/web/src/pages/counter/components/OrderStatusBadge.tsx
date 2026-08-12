import { type OrderStatus } from "../data"

const statusStyles: Record<OrderStatus, string> = {
  待制作: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  制作中: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  待取餐: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  已完成: "bg-muted text-muted-foreground",
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${statusStyles[status]} ${className}`}
    >
      {status}
    </span>
  )
}
