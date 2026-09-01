import { ProductStoreStatus, type ProductView } from "@dextea/constraints"

import { cn } from "@/shared/lib/cn"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { PRODUCT_STORE_ACTIVE } from "@/features/product/model"

interface ProductCardProps {
  product: ProductView
  batchMode: boolean
  selected: boolean
  onToggleSelect: (id: number) => void
  onManageCustomizations: (product: ProductView) => void
  onRequestToggle: (product: ProductView) => void
}

export function ProductCard({
  product,
  batchMode,
  selected,
  onToggleSelect,
  onManageCustomizations,
  onRequestToggle,
}: ProductCardProps) {
  const color = ProductStoreStatus.getColor(product.storeStatus)
  const active = product.storeStatus === PRODUCT_STORE_ACTIVE

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border p-4 transition hover:border-ring hover:shadow-sm",
        batchMode && selected && "border-primary",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {batchMode && (
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggleSelect(product.id)}
              className="mt-0.5"
            />
          )}
          <h3 className="text-sm font-semibold leading-snug">{product.name}</h3>
        </div>
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium"
          style={{
            color: color?.text,
            backgroundColor: color?.background,
            border: color ? `1px solid ${color.border}` : undefined,
          }}
        >
          {ProductStoreStatus.getLabel(product.storeStatus)}
        </span>
      </div>

      {product.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <span className="text-base font-semibold">¥{product.price.toFixed(2)}</span>
        {!batchMode && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageCustomizations(product)}
            >
              管理客制化
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRequestToggle(product)}
              className={cn(
                active
                  ? "border-red-600/60 text-red-600 hover:border-red-600 hover:bg-red-600/10 hover:text-red-700"
                  : "border-green-600/60 text-green-600 hover:border-green-600 hover:bg-green-600/10 hover:text-green-700",
              )}
            >
              {active ? "下架" : "上架"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
