import { useEffect, useState } from "react"

import { storeApi, type StoreView } from "@/lib/api/store"
import { ApiError } from "@/lib/api/request"
import { getStore, saveStore } from "@/lib/session"
import { logger } from "@/lib/logger"
import { toast } from "@/lib/toast"

export function useStore(): StoreView | null {
  const [store, setStore] = useState<StoreView | null>(getStore)

  useEffect(() => {
    let cancelled = false

    storeApi
      .getStore()
      .then((data) => {
        if (cancelled) return
        saveStore(data)
        setStore(data)
      })
      .catch((err) => {
        if (cancelled) return
        logger.error("获取门店信息失败", err)
        if (!getStore()) {
          toast.error(err instanceof ApiError ? err.message : "获取门店信息失败")
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return store
}
