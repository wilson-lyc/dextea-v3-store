import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Coffee } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getOrderDetail,
  getOrderWindow,
  storeName,
  type Order,
} from "./data"
import { OrderCard } from "./components/OrderCard"
import { OrderDetail, OrderDetailEmpty } from "./components/OrderDetail"

const VISIBLE_MAKING_STATUS = [1, 2]

const statusTabs: { key: number | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: 1, label: "制作中" },
  { key: 2, label: "待取餐" },
]

export default function CounterPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<number | "all">("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getOrderWindow()
      .then((orders) => {
        if (cancelled) return
        setAllOrders(orders)
      })
      .catch(() => {
        if (!cancelled) setAllOrders([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const visibleOrders = useMemo(
    () =>
      allOrders.filter(
        (order) =>
          order.paymentStatus === 2 &&
          VISIBLE_MAKING_STATUS.includes(order.makingStatus)
      ),
    [allOrders]
  )

  const orders = useMemo<Order[]>(
    () =>
      tab === "all"
        ? visibleOrders
        : visibleOrders.filter((order) => order.makingStatus === tab),
    [tab, visibleOrders]
  )

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: visibleOrders.length }
    for (const order of visibleOrders) {
      map[order.makingStatus] = (map[order.makingStatus] ?? 0) + 1
    }
    return map
  }, [visibleOrders])

  const effectiveSelectedId = selectedId ?? orders[0]?.id ?? null

  const selected = orders.find((order) => order.id === effectiveSelectedId) ?? null

  const [detail, setDetail] = useState<Order | null>(null)

  useEffect(() => {
    if (!effectiveSelectedId) return
    let cancelled = false
    void (async () => {
      try {
        const order = await getOrderDetail(Number(effectiveSelectedId))
        if (!cancelled) setDetail(order)
      } catch {
        if (!cancelled) setDetail(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [effectiveSelectedId])

  // 详情为异步拉取结果，仅在仍对应当前选中项时展示，避免切换选中时残留旧数据
  const detailMatchesSelection = detail !== null && detail.id === effectiveSelectedId
  const displayedDetail = detailMatchesSelection ? detail : selected

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
            {visibleOrders.length}
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
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                  <Coffee className="size-8 animate-pulse text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">订单加载中…</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                  <Coffee className="size-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">当前没有订单</p>
                </div>
              ) : (
                orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    selected={effectiveSelectedId === order.id}
                    onSelect={setSelectedId}
                  />
                ))
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
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden">
          {displayedDetail ? (
            <OrderDetail order={displayedDetail} />
          ) : (
            <OrderDetailEmpty text="请选择左侧订单查看详情" />
          )}
        </section>
      </div>
    </div>
  )
}
