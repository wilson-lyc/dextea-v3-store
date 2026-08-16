import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Clock, Coffee, Loader2 } from "lucide-react"

import { getOrderStatus, type Order } from "../data"
import { OrderStatusBadge } from "./OrderStatusBadge"

interface OrderDetailProps {
  order: Order
}

export function OrderDetail({ order }: OrderDetailProps) {
  const totalQuantity = order.items.reduce((sum, i) => sum + i.quantity, 0)

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
          <OrderStatusBadge status={getOrderStatus(order)} className="px-2 py-1 text-xs" />
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
        {order.paymentStatus === 2 && order.makingStatus === 0 && (
          <Button className="flex-1">
            <Loader2 />
            开始制作
          </Button>
        )}
        {order.paymentStatus === 2 && order.makingStatus === 1 && (
          <Button className="flex-1">
            <Check />
            完成制作
          </Button>
        )}
        {order.paymentStatus === 2 && order.makingStatus === 2 && (
          <Button className="flex-1">
            <Check />
            确认取餐
          </Button>
        )}
        {order.paymentStatus === 2 && order.makingStatus === 3 && (
          <Button className="flex-1" disabled>
            已完成
          </Button>
        )}
      </div>
    </>
  )
}

interface OrderDetailEmptyProps {
  icon?: React.ReactNode
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
