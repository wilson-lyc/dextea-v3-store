import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/cn"

interface PageHeaderProps {
  /** 提供后渲染统一的返回按钮（回到首页） */
  back?: boolean
  /** 自定义返回行为，默认跳转首页 */
  onBack?: () => void
  /** 返回按钮的 aria-label */
  backLabel?: string
  title: ReactNode
  /** 标题右侧、返回按钮之后的内容 */
  leading?: ReactNode
  /** 右侧内容，例如 tab、操作按钮 */
  actions?: ReactNode
  /** actions 容器追加类名，用于调整内部间距 */
  actionsClassName?: string
  className?: string
}

export function PageHeader({
  back,
  onBack,
  backLabel = "返回",
  title,
  leading,
  actions,
  actionsClassName,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        "flex shrink-0 items-center justify-between gap-4 border-b bg-background px-6 py-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {back && (
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={backLabel}
            onClick={
              onBack ??
              (() => {
                navigate(-1)
              })
            }
          >
            <ArrowLeft />
          </Button>
        )}
        {leading}
        <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
      </div>
      {actions && (
        <div className={cn("flex shrink-0 items-center gap-2", actionsClassName)}>
          {actions}
        </div>
      )}
    </header>
  )
}
