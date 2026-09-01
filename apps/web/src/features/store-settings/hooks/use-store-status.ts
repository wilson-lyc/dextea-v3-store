import { useState } from "react"

import type { StoreStatusCode } from "@dextea/constraints"

import { useMutation } from "@/shared/hooks/use-mutation"
import { storeApi } from "@/features/store/api"

export interface StoreStatusMutation {
  pendingStatus: StoreStatusCode | null
  updating: boolean
  requestUpdate: (status: StoreStatusCode) => void
  dismiss: () => void
  confirm: () => Promise<void>
}

export function useStoreStatus(
  onUpdated: (status: StoreStatusCode) => void,
): StoreStatusMutation {
  const [pendingStatus, setPendingStatus] = useState<StoreStatusCode | null>(null)

  const { run, pending } = useMutation(
    async (status: StoreStatusCode) => {
      await storeApi.updateStatus({ status })
      return status
    },
    {
      successMessage: "门店状态已更新",
      errorMessage: "更新门店状态失败",
      onSuccess: onUpdated,
    },
  )

  async function confirm(): Promise<void> {
    if (pendingStatus === null) return
    try {
      await run(pendingStatus)
    } finally {
      setPendingStatus(null)
    }
  }

  return {
    pendingStatus,
    updating: pending,
    requestUpdate: setPendingStatus,
    dismiss: () => setPendingStatus(null),
    confirm,
  }
}
