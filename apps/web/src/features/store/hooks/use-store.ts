import { useState } from "react"

import type { StoreView } from "@dextea/constraints"

import { useAsyncData } from "@/shared/hooks/use-async-data"
import { resolveErrorMessage } from "@/shared/api/errors"
import { toast } from "@/shared/ui/toast"
import { getStore, saveStore } from "@/features/auth/session"
import { storeApi } from "@/features/store/api"

export interface StoreState {
  store: StoreView | null
  loading: boolean
  updateStore: (next: StoreView) => void
}

export function useStoreSource(): StoreState {
  const [cached] = useState(getStore)

  const { data, loading, setData } = useAsyncData<StoreView>(
    async () => {
      const store = await storeApi.getStore()
      saveStore(store)
      return store
    },
    {
      onError: (err) => {
        if (getStore()) return
        toast.add({ title: resolveErrorMessage(err, "获取门店信息失败"), type: "error" })
      },
    },
  )

  function updateStore(next: StoreView): void {
    saveStore(next)
    setData(next)
  }

  return { store: data ?? cached, loading, updateStore }
}
