import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Clock,
  LogOut,
  MapPin,
  Monitor,
  Settings,
  Store,
} from "lucide-react"
import { StoreStatus } from "@dextea/constraints"

import { Button } from "@/shared/ui/button"
import { useStore } from "@/app/store-context"
import { paths } from "@/router/paths"
import { clearSession } from "@/features/auth/session"
import { formatStoreAddress } from "@/features/store/model"
import { logger } from "@/shared/lib/logger"

interface Section {
  key: string
  title: string
  description: string
  icon: typeof Settings
  path: string
}

const sections: Section[] = [
  {
    key: "counter",
    title: "前台服务",
    description: "实时查看门店订单与制作、取餐状态",
    icon: Store,
    path: paths.counter,
  },
  {
    key: "screen",
    title: "服务大屏",
    description: "叫号取餐与订单状态的大屏实时展示",
    icon: Monitor,
    path: paths.screen,
  },
  {
    key: "admin",
    title: "后台设置",
    description: "门店信息、商品与员工等基础配置管理",
    icon: Settings,
    path: paths.admin.root,
  },
]

export default function HomePage() {
  const { store } = useStore()
  const navigate = useNavigate()

  const address = store ? formatStoreAddress(store) : ""
  const statusColor = store ? StoreStatus.getColor(store.status) : undefined

  function handleLogout() {
    clearSession()
    logger.info("已退出登录")
    navigate(paths.login, { replace: true })
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-gradient-to-b from-muted/60 to-background p-6 md:p-10">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {store && (
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
              style={{
                color: statusColor?.text,
                backgroundColor: statusColor?.background,
                borderColor: statusColor?.border,
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: statusColor?.text }}
              />
              {StoreStatus.getLabel(store.status)}
            </span>
          )}
          <h1 className="mt-3 truncate text-3xl font-semibold tracking-tight md:text-4xl">
            {store ? store.name : "..."}
          </h1>
          {store && (
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              {address && (
                <span className="flex min-w-0 items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{address}</span>
                </span>
              )}
              {store.businessHours && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 shrink-0" />
                  <span className="whitespace-nowrap">
                    {store.businessHours}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          退出登录
        </Button>
      </header>

      <main className="mt-8 grid flex-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-6">
        {sections.map(({ key, title, description, icon: Icon, path }) => (
          <button
            key={key}
            type="button"
            onClick={() => navigate(path)}
            className="group flex flex-col justify-between rounded-2xl border bg-card p-6 text-left shadow-sm transition hover:border-primary/40 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:p-8"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 md:size-14">
                <Icon className="size-6 md:size-7" />
              </div>
              <ArrowRight className="size-5 text-muted-foreground/40 transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <div className="mt-6 md:mt-8">
              <div className="text-xl font-semibold md:text-2xl">{title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </button>
        ))}
      </main>
    </div>
  )
}
