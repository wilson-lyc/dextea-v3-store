import { useState } from "react"

import type { ProductView } from "@dextea/constraints"

import { useMutation } from "@/shared/hooks/use-mutation"
import type { DataUpdater } from "@/shared/hooks/use-async-data"
import { productApi } from "@/features/product/api"

export interface ProductStatusMutation {
  pending: ProductView | null
  toggling: boolean
  requestToggle: (product: ProductView) => void
  dismiss: () => void
  confirm: () => Promise<void>
}

export function useProductStatusMutation(
  setProducts: (updater: DataUpdater<ProductView[]>) => void,
): ProductStatusMutation {
  const [pending, setPending] = useState<ProductView | null>(null)

  const { run, pending: toggling } = useMutation(
    async (product: ProductView) => {
      const { storeStatus } = await productApi.toggleStoreStatus(product.id)
      return { id: product.id, storeStatus }
    },
    {
      errorMessage: "切换商品门店状态失败",
      onSuccess: ({ id, storeStatus }) =>
        setProducts((prev) =>
          (prev ?? []).map((item) =>
            item.id === id ? { ...item, storeStatus } : item,
          ),
        ),
    },
  )

  async function confirm(): Promise<void> {
    if (pending === null) return
    const result = await run(pending)
    if (result) setPending(null)
  }

  return {
    pending,
    toggling,
    requestToggle: setPending,
    dismiss: () => setPending(null),
    confirm,
  }
}
