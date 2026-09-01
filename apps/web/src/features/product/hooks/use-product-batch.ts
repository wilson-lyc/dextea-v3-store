import { useState } from "react"

import type { ProductStoreStatusCode, ProductView } from "@dextea/constraints"

import { useMutation } from "@/shared/hooks/use-mutation"
import type { DataUpdater } from "@/shared/hooks/use-async-data"
import { productApi } from "@/features/product/api"
import type { ProductFilter } from "@/features/product/model"

export interface ProductBatch {
  filter: ProductFilter
  setFilter: (filter: ProductFilter) => void
  batchMode: boolean
  enterBatchMode: () => void
  exitBatchMode: () => void
  selectedIds: number[]
  toggleSelect: (id: number) => void
  batchTarget: ProductStoreStatusCode | null
  requestBatch: (status: ProductStoreStatusCode) => void
  dismissBatch: () => void
  confirmBatch: () => Promise<void>
  submitting: boolean
}

export function useProductBatch(
  setProducts: (updater: DataUpdater<ProductView[]>) => void,
): ProductBatch {
  const [filter, setFilter] = useState<ProductFilter>("ALL")
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [batchTarget, setBatchTarget] = useState<ProductStoreStatusCode | null>(null)

  const { run, pending } = useMutation(
    async (ids: number[], status: ProductStoreStatusCode) => {
      await productApi.batchSetStoreStatus(ids, status)
      return { ids, status }
    },
    {
      errorMessage: "批量切换门店状态失败",
      onSuccess: ({ ids, status }) =>
        setProducts((prev) =>
          (prev ?? []).map((item) =>
            ids.includes(item.id) ? { ...item, storeStatus: status } : item,
          ),
        ),
    },
  )

  function exitBatchMode(): void {
    setBatchMode(false)
    setSelectedIds([])
  }

  function toggleSelect(id: number): void {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  async function confirmBatch(): Promise<void> {
    if (batchTarget === null || selectedIds.length === 0) return
    const result = await run(selectedIds, batchTarget)
    if (!result) return
    setBatchTarget(null)
    exitBatchMode()
  }

  return {
    filter,
    setFilter,
    batchMode,
    enterBatchMode: () => setBatchMode(true),
    exitBatchMode,
    selectedIds,
    toggleSelect,
    batchTarget,
    requestBatch: setBatchTarget,
    dismissBatch: () => setBatchTarget(null),
    confirmBatch,
    submitting: pending,
  }
}
