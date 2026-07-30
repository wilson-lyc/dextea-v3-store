import { Package } from "lucide-react"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Package className="size-8" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">商品管理</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              功能建设中，敬请期待
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
