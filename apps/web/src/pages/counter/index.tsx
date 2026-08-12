import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Coffee } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  activeOrders,
  storeName,
  type Order,
  type OrderStatus,
} from "./data"
import { OrderCard } from "./components/OrderCard"
import { OrderDetail, OrderDetailEmpty } from "./components/OrderDetail"

const statusTabs: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "待制作", label: "待制作" },
  { key: "制作中", label: "制作中" },
  { key: "待取餐", label: "待取餐" },
  { key: "已完成", label: "已完成" },
]

export default function CounterPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<OrderStatus | "all">("all")
  const [selectedId, setSelectedId] = useState<string | null>(
    activeOrders[0]?.id ?? null
  )

  const orders = useMemo<Order[]>(
    () =>
      tab === "all"
        ? activeOrders
        : activeOrders.filter((order) => order.status === tab),
    [tab]
  )

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: activeOrders.length }
    for (const order of activeOrders) {
      map[order.status] = (map[order.status] ?? 0) + 1
    }
    return map
  }, [])

  const selected = orders.find((order) => order.id === selectedId) ?? null

  return (
    <div className="flex h-svh flex-col bg-muted/30">
      <header className="flex items-center justify-between gap-4 border-b bg-background px-6 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => navigate("/")}
            aria-label="返回首页"
          >
            <ArrowLeft />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Coffee className="size-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold">{storeName}</h1>
              <p className="text-xs text-muted-foreground">前台订单查看</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">订单总数</span>
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {activeOrders.length}
          </span>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto border-b bg-background px-4 py-3">
        {statusTabs.map((item) => (
          <Button
            key={item.key}
            size="sm"
            variant={tab === item.key ? "default" : "outline"}
            onClick={() => setTab(item.key)}
          >
            {item.label}
            <span className="ml-1 opacity-70">{counts[item.key] ?? 0}</span>
          </Button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-[340px_1fr]">
        <section className="flex min-h-0 flex-col overflow-hidden border-r">
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-2 p-3">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                  <Coffee className="size-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">当前没有订单</p>
                </div>
              ) : (
                orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    selected={selectedId === order.id}
                    onSelect={setSelectedId}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="shrink-0 border-t bg-background px-3 py-2.5 text-center text-xs text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
          >
            仅展示最近 3 小时内订单，查看更多数据请点击
            <span className="font-medium text-primary">此处</span>
          </a>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden">
          {selected ? (
            <OrderDetail order={selected} />
          ) : (
            <OrderDetailEmpty text="请选择左侧订单查看详情" />
          )}
        </section>
      </div>
    </div>
  )
}
