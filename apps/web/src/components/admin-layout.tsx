import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { ArrowLeft, Package, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface NavItem {
  to: string
  label: string
  icon: typeof Settings
}

const navItems: NavItem[] = [
  {
    to: "/admin/settings",
    label: "门店设置",
    icon: Settings,
  },
  {
    to: "/admin/products",
    label: "商品管理",
    icon: Package,
  },
]

export function AdminLayout() {
  const navigate = useNavigate()

  return (
    <div className="flex h-svh flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b px-6 py-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate("/")}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">后台设置</h1>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="w-56 shrink-0 border-r p-3">
          <ul className="flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )
                  }
                >
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 p-6">
          <ScrollArea className="h-full pr-px">
            <Outlet />
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}
