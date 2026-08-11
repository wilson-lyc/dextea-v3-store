import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Coffee } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  activeOrders,
  storeName,
  type Order,
  type OrderStatus,
} from "./data"

const statusTabs: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "待制作", label: "待制作" },
  { key: "制作中", label: "制作中" },
  { key: "待取餐", label: "待取餐" },
  { key: "已完成", label: "已完成" },
]

const statusStyles: Record<OrderStatus, string> = {
  待制作: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  制作中: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  待取餐: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  已完成: "bg-muted text-muted-foreground",
}

export default function CounterPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<OrderStatus | "all">("all")

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

      <div className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto p-4 sm:grid-cols-2 xl:grid-cols-3">
        {orders.length === 0 ? (
          <div className="col-span-full flex flex-1 flex-col items-center justify-center gap-2 py-20 text-center">
            <Coffee className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">当前没有订单</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="flex flex-col">
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">{order.code}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {order.type}
                    </span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>
                <ul className="space-y-1">
                  {order.items.map((line) => (
                    <li
                      key={line.id}
                      className="flex justify-between text-sm text-muted-foreground"
                    >
                      <span>
                        {line.name} ×{line.quantity}
                      </span>
                      <span>¥{line.price * line.quantity}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t pt-2 text-xs">
                  <span className="text-muted-foreground">
                    {order.customer} · {order.createdAt}
                  </span>
                  <span className="text-sm font-semibold">¥{order.total}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
