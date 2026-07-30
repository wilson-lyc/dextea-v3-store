import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

export default function PlaceholderPage({ title }: { title: string }) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">功能建设中，敬请期待</p>
      <Button variant="outline" onClick={() => navigate("/")}>
        返回首页
      </Button>
    </div>
  )
}
