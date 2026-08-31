import { Coffee } from "lucide-react"

import { ScrollArea } from "@/shared/ui/scroll-area"
import type { Order } from "@/features/order/model"
import { OrderCard } from "@/features/order/components/order-card"

interface OrderListProps {
  orders: Order[]
  loading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
}

export function OrderList({ orders, loading, selectedId, onSelect }: OrderListProps) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex min-h-full flex-col">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-3 text-center">
            <Coffee className="size-8 animate-pulse text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">订单加载中…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-3 text-center">
            <Coffee className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">当前没有订单</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                selected={selectedId === order.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
        <p className="px-3 py-2.5 text-center text-xs text-muted-foreground">
          仅展示最近 3 小时内订单，查看更多数据请点击
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="ml-0.5 font-medium text-primary transition hover:text-primary/80"
          >
            此处
          </a>
        </p>
      </div>
    </ScrollArea>
  )
}
