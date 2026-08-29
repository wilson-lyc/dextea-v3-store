import { Package } from "lucide-react"

import { ScrollArea } from "@/shared/ui/scroll-area"
import { useProducts } from "@/features/product/hooks/use-products"
import { useProductBatch } from "@/features/product/hooks/use-product-batch"
import { useProductStatusMutation } from "@/features/product/hooks/use-product-status-mutation"
import { useCustomizations } from "@/features/product/hooks/use-customizations"
import { countProducts, filterProducts } from "@/features/product/model"
import { ProductCard } from "@/features/product/components/product-card"
import { ProductToolbar } from "@/features/product/components/product-toolbar"
import { CustomizeDialog } from "@/features/product/components/customize-dialog"
import { ToggleStatusDialog } from "@/features/product/components/toggle-status-dialog"
import { BatchStatusDialog } from "@/features/product/components/batch-status-dialog"

export default function ProductsPage() {
  const { products, loading, refreshing, reload, setProducts } = useProducts()
  const batch = useProductBatch(setProducts)
  const status = useProductStatusMutation(setProducts)
  const customize = useCustomizations()

  const filtered = filterProducts(products, batch.filter)
  const counts = countProducts(products)

  return (
    <div className="flex h-full flex-col">
      <ProductToolbar
        filter={batch.filter}
        counts={counts}
        batchMode={batch.batchMode}
        selectedCount={batch.selectedIds.length}
        refreshing={refreshing}
        loading={loading}
        submitting={batch.submitting}
        onFilterChange={batch.setFilter}
        onEnterBatchMode={batch.enterBatchMode}
        onExitBatchMode={batch.exitBatchMode}
        onRefresh={reload}
        onRequestBatch={batch.requestBatch}
      />

      <ScrollArea className="flex-1 px-6 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Package className="size-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {products.length === 0 ? "暂无上架商品" : "无符合条件的商品"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {products.length === 0
                  ? "全局上架的商品将显示在这里"
                  : "请调整筛选条件后重试"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                batchMode={batch.batchMode}
                selected={batch.selectedIds.includes(product.id)}
                onToggleSelect={batch.toggleSelect}
                onManageCustomizations={customize.open}
                onRequestToggle={status.requestToggle}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <ToggleStatusDialog mutation={status} />
      <BatchStatusDialog batch={batch} />

      <CustomizeDialog
        target={customize.target}
        items={customize.items}
        loading={customize.loading}
        toggling={customize.toggling}
        onOpenChange={(open) => {
          if (!open) customize.close()
        }}
        onToggleOption={customize.toggleOption}
      />
    </div>
  )
}
