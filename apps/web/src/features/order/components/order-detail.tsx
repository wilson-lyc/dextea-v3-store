import type { ReactNode } from "react"
import { Check, Clock, Coffee, Loader2 } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { nextOrderAction, type Order, type OrderAction } from "@/features/order/model"
import { OrderStatusBadge } from "@/features/order/components/order-status-badge"

interface OrderDetailProps {
  order: Order
  onAction?: (action: OrderAction) => void
  actionPending?: boolean
}

export function OrderDetail({ order, onAction, actionPending }: OrderDetailProps) {
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const action = nextOrderAction(order)

  return (
    <>
      <div className="shrink-0 p-6 pb-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{order.code}</h2>
            <span className="rounded bg-muted px-2 py-1 text-sm text-muted-foreground">
              {order.type}
            </span>
          </div>
          <OrderStatusBadge order={order} className="px-2 py-1 text-xs" />
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
          <Clock className="size-3.5" />
          <span>{order.createdAt}</span>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2 p-6 pt-5">
          {order.items.map((line) => (
            <div
              key={line.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                {line.coverUrl && (
                  <img
                    src={line.coverUrl}
                    alt={line.name}
                    className="size-12 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{line.name}</p>
                  {line.customization && (
                    <p className="truncate text-xs text-muted-foreground">
                      {line.customization.replace(/_/g, " · ")}
                    </p>
                  )}
                  {line.note && (
                    <p className="truncate text-xs text-muted-foreground">备注：{line.note}</p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  ¥{line.price} ×{line.quantity}
                </span>
                <span className="font-semibold">
                  ¥{line.price * line.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="shrink-0 space-y-2 border-t bg-background p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">总数量</span>
          <span className="font-semibold">{totalQuantity} 件</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">总价</span>
          <span className="text-2xl font-semibold">¥{order.total}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t bg-background p-4">
        {action && (
          <Button
            className="flex-1"
            disabled={action.disabled || actionPending}
            onClick={() => onAction?.(action)}
          >
            {actionPending && <Loader2 className="animate-spin" />}
            {!actionPending && action.icon === "loader" && <Loader2 />}
            {!actionPending && action.icon === "check" && <Check />}
            {action.label}
          </Button>
        )}
      </div>
    </>
  )
}

interface OrderDetailEmptyProps {
  icon?: ReactNode
  text: string
}

export function OrderDetailEmpty({ icon, text }: OrderDetailEmptyProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
      {icon ?? <Coffee className="size-8 text-muted-foreground/50" />}
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
