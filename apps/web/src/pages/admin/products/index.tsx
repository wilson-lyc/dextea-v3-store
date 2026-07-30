import { useEffect, useState } from "react"
import { Package, RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { productApi, type ProductView } from "@/lib/api/product"
import { ApiError } from "@/lib/api/request"
import { logger } from "@/lib/logger"
import { toast } from "@/lib/toast"

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductView[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    productApi
      .listActive()
      .then((data) => {
        if (cancelled) return
        setProducts(data)
      })
      .catch((err) => {
        if (cancelled) return
        logger.error("获取商品列表失败", err)
        toast.error(err instanceof ApiError ? err.message : "获取商品列表失败")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>商品列表</CardTitle>
          <CardDescription>全局上架的商品</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">加载中...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Package className="size-8" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">暂无上架商品</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  全局上架的商品将显示在这里
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 transition hover:border-ring hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-snug">
                      {product.name}
                    </h3>
                    <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                      上架
                    </span>
                  </div>
                  {product.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-base font-semibold">
                      ¥{product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
