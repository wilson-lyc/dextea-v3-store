import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/shared/ui/button"
import { PageHeader } from "@/shared/ui/page-header"
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
import { useOrderEvents } from "@/features/order/hooks/use-order-events"
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

  // SSE 收到新订单：只把卡片插到列表最前面。
  // 用户尚未手动点选时，把选中项钉在原来的第一单上，右侧详情保持不变，
  // 直到人工点击卡片后才切换过去。
  useOrderEvents((updater) => {
    if (selectedId === null && orders[0]) {
      setSelectedId(orders[0].id)
    }
    setOrders(updater)
  }, reload)

  return (
    <div className="flex h-svh flex-col bg-muted/30">
      <PageHeader
        back
        onBack={() => navigate(paths.home)}
        backLabel="返回首页"
        title={store ? store.name : "门店"}
        actions={ORDER_TABS.map((item) => (
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
        actionsClassName="gap-2 overflow-x-auto"
      />

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
