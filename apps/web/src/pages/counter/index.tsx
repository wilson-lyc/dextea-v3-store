import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Check, Coffee, Loader2, Package, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedId(order.id)}
                    className={`flex w-full flex-col gap-1 rounded-xl border bg-background p-3 text-left transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selectedId === order.id
                        ? "border-primary ring-1 ring-primary"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{order.code}</span>
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
                    <p className="truncate text-xs text-muted-foreground">
                      {order.items.map((i) => `${i.name}×${i.quantity}`).join("，")}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {order.customer} · {order.createdAt}
                      </span>
                      <span className="font-semibold">¥{order.total}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden">
          {selected ? (
            <>
              <ScrollArea className="min-h-0 flex-1">
                <div className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{selected.code}</h2>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {selected.type}
                    </span>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${statusStyles[selected.status]}`}
                  >
                    {selected.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Store className="size-3.5" />
                    {selected.customer}
                  </span>
                  <span>{selected.createdAt}</span>
                </div>

                <div className="mt-5 space-y-2">
                  {selected.items.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{line.name}</p>
                        {line.note && (
                          <p className="text-xs text-muted-foreground">
                            备注：{line.note}
                          </p>
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
                  <span className="text-2xl font-semibold">
                    ¥{selected.total}
                  </span>
                </div>
              </div>
              </ScrollArea>

              <div className="flex shrink-0 items-center gap-3 border-t bg-background p-4">
                <Button variant="outline" className="flex-1" disabled>
                  <Package />
                  打印小票
                </Button>
                {selected.status === "待制作" && (
                  <Button className="flex-1">
                    <Loader2 />
                    开始制作
                  </Button>
                )}
                {selected.status === "制作中" && (
                  <Button className="flex-1">
                    <Check />
                    完成制作
                  </Button>
                )}
                {selected.status === "待取餐" && (
                  <Button className="flex-1">
                    <Check />
                    确认取餐
                  </Button>
                )}
                {(selected.status === "已完成") && (
                  <Button className="flex-1" disabled>
                    已完成
                  </Button>
                )}
                </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <Coffee className="size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">请选择左侧订单查看详情</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
