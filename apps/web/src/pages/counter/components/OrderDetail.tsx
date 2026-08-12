import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Coffee, Loader2, Store } from "lucide-react"

import { type Order } from "../data"
import { OrderStatusBadge } from "./OrderStatusBadge"

interface OrderDetailProps {
  order: Order
}

export function OrderDetail({ order }: OrderDetailProps) {
  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{order.code}</h2>
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {order.type}
              </span>
            </div>
            <OrderStatusBadge status={order.status} className="px-2 py-1 text-xs" />
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Store className="size-3.5" />
              {order.customer}
            </span>
            <span>{order.createdAt}</span>
          </div>

          <div className="mt-5 space-y-2">
            {order.items.map((line) => (
              <div
                key={line.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{line.name}</p>
                  {line.note && (
                    <p className="text-xs text-muted-foreground">备注：{line.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
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

          <div className="mt-5 flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">合计</span>
            <span className="text-2xl font-semibold">¥{order.total}</span>
          </div>
        </div>
      </ScrollArea>

      <div className="flex shrink-0 items-center gap-3 border-t bg-background p-4">
        {order.status === "待制作" && (
          <Button className="flex-1">
            <Loader2 />
            开始制作
          </Button>
        )}
        {order.status === "制作中" && (
          <Button className="flex-1">
            <Check />
            完成制作
          </Button>
        )}
        {order.status === "待取餐" && (
          <Button className="flex-1">
            <Check />
            确认取餐
          </Button>
        )}
        {order.status === "已完成" && (
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
