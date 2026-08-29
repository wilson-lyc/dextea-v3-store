import { ListChecksIcon, RefreshCwIcon, XIcon } from "lucide-react"

import type { ProductStoreStatusCode } from "@dextea/constraints"

import { cn } from "@/shared/lib/cn"
import { Button } from "@/shared/ui/button"
import {
  PRODUCT_FILTERS,
  PRODUCT_STORE_ACTIVE,
  PRODUCT_STORE_DISABLED,
  type ProductCounts,
  type ProductFilter,
} from "@/features/product/model"

interface ProductToolbarProps {
  filter: ProductFilter
  counts: ProductCounts
  batchMode: boolean
  selectedCount: number
  refreshing: boolean
  loading: boolean
  submitting: boolean
  onFilterChange: (filter: ProductFilter) => void
  onEnterBatchMode: () => void
  onExitBatchMode: () => void
  onRefresh: () => void
  onRequestBatch: (status: ProductStoreStatusCode) => void
}

export function ProductToolbar({
  filter,
  counts,
  batchMode,
  selectedCount,
  refreshing,
  loading,
  submitting,
  onFilterChange,
  onEnterBatchMode,
  onExitBatchMode,
  onRefresh,
  onRequestBatch,
}: ProductToolbarProps) {
  const countsByFilter: Record<ProductFilter, number> = {
    ALL: counts.all,
    ACTIVE: counts.active,
    DISABLED: counts.disabled,
  }

  return (
    <div className="flex shrink-0 items-center gap-2 border-b px-6 py-3">
      {batchMode ? (
        <>
          <Button variant="ghost" size="sm" onClick={onExitBatchMode}>
            <XIcon className="size-4" />
            取消
          </Button>
          <span className="text-sm text-muted-foreground">已选 {selectedCount} 项</span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            disabled={selectedCount === 0 || submitting}
            onClick={() => onRequestBatch(PRODUCT_STORE_DISABLED)}
          >
            批量下架
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedCount === 0 || submitting}
            onClick={() => onRequestBatch(PRODUCT_STORE_ACTIVE)}
          >
            批量上架
          </Button>
        </>
      ) : (
        <>
          {PRODUCT_FILTERS.map((item) => (
            <Button
              key={item.key}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange(item.key)}
              className={cn(
                filter === item.key
                  ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
              <span className="text-xs tabular-nums">{countsByFilter[item.key]}</span>
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            disabled={refreshing || loading}
            onClick={onEnterBatchMode}
          >
            <ListChecksIcon className="size-4" />
            批量操作
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={refreshing || loading}
            onClick={onRefresh}
          >
            <RefreshCwIcon className={cn("size-4", refreshing && "animate-spin")} />
            刷新
          </Button>
        </>
      )}
    </div>
  )
}
