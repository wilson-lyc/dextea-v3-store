import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { ArrowLeft, Package, Settings } from "lucide-react"

import { paths } from "@/router/paths"
import { Button } from "@/shared/ui/button"
import { PageHeader } from "@/shared/ui/page-header"
import { cn } from "@/shared/lib/cn"

interface NavItem {
  to: string
  label: string
  icon: typeof Settings
}

const navItems: NavItem[] = [
  {
    to: paths.admin.settings,
    label: "门店设置",
    icon: Settings,
  },
  {
    to: paths.admin.products,
    label: "商品管理",
    icon: Package,
  },
]

export function AdminLayout() {
  const navigate = useNavigate()

  return (
    <div className="flex h-svh flex-col">
      <PageHeader
        back
        onBack={() => navigate(paths.home)}
        backLabel="返回首页"
        title="后台设置"
        actions={navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
        actionsClassName="gap-1"
      />

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
