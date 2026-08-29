import { ProductStoreStatus, type ProductStoreStatusCode } from "@dextea/constraints"

import { ConfirmDialog } from "@/shared/components/confirm-dialog"
import type { ProductBatch } from "@/features/product/hooks/use-product-batch"

interface BatchStatusDialogProps {
  batch: ProductBatch
}

export function BatchStatusDialog({ batch }: BatchStatusDialogProps) {
  const target: ProductStoreStatusCode | null = batch.batchTarget

  return (
    <ConfirmDialog
      open={target !== null}
      title="确认批量切换门店状态"
      confirmLabel="确认切换"
      pending={batch.submitting}
      onOpenChange={(open) => {
        if (!open) batch.dismissBatch()
      }}
      onConfirm={batch.confirmBatch}
      description={
        target !== null && (
          <>
            确定要将选中的 {batch.selectedIds.length} 个商品批量切换为
            <span className="font-medium text-foreground">
              {" "}
              {ProductStoreStatus.getLabel(target)}{" "}
            </span>
            吗？
          </>
        )
      }
    />
  )
}
