import type { ProductView } from "@dextea/constraints"

import { useAsyncData, type DataUpdater } from "@/shared/hooks/use-async-data"
import { resolveErrorMessage } from "@/shared/api/errors"
import { toast } from "@/shared/ui/toast"
import { productApi } from "@/features/product/api"

const EMPTY_PRODUCTS: ProductView[] = []

export interface ProductsState {
  products: ProductView[]
  loading: boolean
  refreshing: boolean
  reload: () => void
  setProducts: (updater: DataUpdater<ProductView[]>) => void
}

export function useProducts(): ProductsState {
  const { data, loading, reload, setData } = useAsyncData<ProductView[]>(
    productApi.listActive,
    {
      onError: (err) => {
        toast.add({ title: resolveErrorMessage(err, "获取商品列表失败"), type: "error" })
      },
    },
  )

  return {
    products: data ?? EMPTY_PRODUCTS,
    loading,
    refreshing: loading && data !== undefined,
    reload,
    setProducts: setData,
  }
}
