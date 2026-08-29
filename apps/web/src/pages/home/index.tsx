import { useNavigate } from "react-router-dom"
import { Monitor, Settings, Store } from "lucide-react"
import { StoreStatus } from "@dextea/constraints"

import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { useStore } from "@/app/store-provider"
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
    key: "admin",
    title: "后台设置",
    description: "门店信息、商品与员工等基础配置管理",
    icon: Settings,
    path: paths.admin.root,
  },
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
]

export default function HomePage() {
  const { store } = useStore()
  const navigate = useNavigate()

  const address = store ? formatStoreAddress(store) : ""

  function handleLogout() {
    clearSession()
    logger.info("已退出登录")
    navigate(paths.login, { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col p-6 md:p-10">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            你好，{store ? store.name : "..."}
          </h1>
          {store && (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              <span>{StoreStatus.getLabel(store.status)}</span>
              {address && <span>· {address}</span>}
              {store.businessHours && <span>· 营业时间 {store.businessHours}</span>}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          退出登录
        </Button>
      </header>

      <main className="mt-10 grid flex-1 content-start gap-6 md:grid-cols-3">
        {sections.map(({ key, title, description, icon: Icon, path }) => (
          <Card
            key={key}
            role="button"
            tabIndex={0}
            onClick={() => navigate(path)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                navigate(path)
              }
            }}
            className="cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-8" />
              </div>
              <div className="text-xl font-semibold">{title}</div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  )
}
