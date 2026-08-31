import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Coffee } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { useStore } from "@/app/store-context"
import { paths } from "@/router/paths"
import {
  ORDER_TABS,
  countOrders,
  isCounterVisible,
  type OrderTabKey,
} from "@/features/order/model"
import { useOrderWindow } from "@/features/order/hooks/use-order-window"
import { useOrderDetail } from "@/features/order/hooks/use-order-detail"
import { useOrderReady } from "@/features/order/hooks/use-order-ready"
import { useOrderCollect } from "@/features/order/hooks/use-order-collect"
import { OrderList } from "@/features/order/components/order-list"
import {
  OrderDetail,
  OrderDetailEmpty,
} from "@/features/order/components/order-detail"

export default function CounterPage() {
  const navigate = useNavigate()
  const { store } = useStore()
  const [tab, setTab] = useState<OrderTabKey>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { orders: allOrders, loading, setOrders } = useOrderWindow()

  const visibleOrders = useMemo(
    () => allOrders.filter(isCounterVisible),
    [allOrders],
  )

  const orders = useMemo(
    () =>
      tab === "all"
        ? visibleOrders
        : visibleOrders.filter((order) => order.makingStatus === tab),
    [tab, visibleOrders],
  )

  const counts = useMemo(() => countOrders(visibleOrders), [visibleOrders])

  const effectiveSelectedId = selectedId ?? orders[0]?.id ?? null
  const selected = orders.find((order) => order.id === effectiveSelectedId) ?? null

  const { order: detail, reload: reloadDetail } = useOrderDetail(effectiveSelectedId)
  const detailMatchesSelection = detail !== null && detail.id === effectiveSelectedId
  const displayedDetail = detailMatchesSelection ? detail : selected

  const orderReady = useOrderReady({ setOrders, reloadDetail })
  const orderCollect = useOrderCollect({ setOrders, reloadDetail })

  return (
    <div className="flex h-svh flex-col bg-muted/30">
      <header className="flex items-center justify-between gap-4 border-b bg-background px-6 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => navigate(paths.home)}
            aria-label="返回首页"
          >
            <ArrowLeft />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Coffee className="size-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold">{store ? store.name : "门店"}</h1>
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
        {ORDER_TABS.map((item) => (
          <Button
            key={item.key}
            size="sm"
            variant={tab === item.key ? "default" : "outline"}
            onClick={() => setTab(item.key)}
          >
            {item.label}
            <span className="ml-1 opacity-70">
              {item.key === "all" ? counts.all : (counts.byMakingStatus[item.key] ?? 0)}
            </span>
          </Button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-[340px_1fr]">
        <section className="flex min-h-0 flex-col overflow-hidden border-r">
          <OrderList
            orders={orders}
            loading={loading}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
          />
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden">
          {displayedDetail ? (
            <OrderDetail
              order={displayedDetail}
              actionPending={orderReady.pending || orderCollect.pending}
              onAction={(action) => {
                if (action.action === "ready") orderReady.run(displayedDetail)
                if (action.action === "collect") orderCollect.run(displayedDetail)
              }}
            />
          ) : (
            <OrderDetailEmpty text="请选择左侧订单查看详情" />
          )}
        </section>
      </div>
    </div>
  )
}
