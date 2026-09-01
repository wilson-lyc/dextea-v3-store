import { ProductStoreStatus, type ProductView } from "@dextea/constraints"

import { ConfirmDialog } from "@/shared/components/confirm-dialog"
import type { ProductStatusMutation } from "@/features/product/hooks/use-product-status-mutation"
import { nextProductStoreStatus } from "@/features/product/model"

interface ToggleStatusDialogProps {
  mutation: ProductStatusMutation
}

export function ToggleStatusDialog({ mutation }: ToggleStatusDialogProps) {
  const product: ProductView | null = mutation.pending

  return (
    <ConfirmDialog
      open={product !== null}
      title="确认切换门店状态"
      confirmLabel="确认切换"
      pending={mutation.toggling}
      onOpenChange={(open) => {
        if (!open) mutation.dismiss()
      }}
      onConfirm={mutation.confirm}
      description={
        product !== null && (
          <>
            确定要将「{product.name}」的门店状态切换为
            <span className="font-medium text-foreground">
              {" "}
              {ProductStoreStatus.getLabel(nextProductStoreStatus(product))}{" "}
            </span>
            吗？
          </>
        )
      }
    />
  )
}
