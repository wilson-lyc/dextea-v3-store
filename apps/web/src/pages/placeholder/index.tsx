import { useMatches, useNavigate } from "react-router-dom"

import { Button } from "@/shared/ui/button"
import { paths } from "@/router/paths"

interface RouteHandle {
  title?: string
}

export default function PlaceholderPage() {
  const navigate = useNavigate()
  const handle = useMatches().at(-1)?.handle as RouteHandle | undefined

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{handle?.title}</h1>
      <p className="text-sm text-muted-foreground">功能建设中，敬请期待</p>
      <Button variant="outline" onClick={() => navigate(paths.home)}>
        返回首页
      </Button>
    </div>
  )
}
