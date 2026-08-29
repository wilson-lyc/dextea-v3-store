import { useState } from "react"

import type {
  CustomizationItemView,
  CustomizationOptionStoreStatusCode,
  ProductView,
} from "@dextea/constraints"

import { useAsyncData } from "@/shared/hooks/use-async-data"
import { useMutation } from "@/shared/hooks/use-mutation"
import { resolveErrorMessage } from "@/shared/api/errors"
import { toast } from "@/shared/ui/toast"
import { productApi } from "@/features/product/api"
import {
  OPTION_STORE_ACTIVE,
  OPTION_STORE_DISABLED,
} from "@/features/product/model"

const EMPTY_ITEMS: CustomizationItemView[] = []

export interface CustomizationsState {
  target: ProductView | null
  items: CustomizationItemView[]
  loading: boolean
  toggling: boolean
  open: (product: ProductView) => void
  close: () => void
  toggleOption: (optionId: number, checked: boolean) => void
}

export function useCustomizations(): CustomizationsState {
  const [target, setTarget] = useState<ProductView | null>(null)
  const productId = target?.id ?? null

  const { data, loading, setData } = useAsyncData<CustomizationItemView[]>(
    () =>
      productId === null
        ? Promise.resolve(EMPTY_ITEMS)
        : productApi.listCustomizations(productId),
    {
      immediate: productId !== null,
      deps: [productId],
      onError: (err) => {
        toast.add({
          title: resolveErrorMessage(err, "获取客制化列表失败"),
          type: "error",
        })
      },
    },
  )

  const { run, pending } = useMutation(
    async (optionId: number, status: CustomizationOptionStoreStatusCode) => {
      await productApi.updateOptionStoreStatus(optionId, status)
      return { optionId, status }
    },
    {
      errorMessage: "更新客制化选项门店状态失败",
      onSuccess: ({ optionId, status }) =>
        setData((prev) =>
          (prev ?? []).map((item) => ({
            ...item,
            options: item.options.map((option) =>
              option.id === optionId ? { ...option, storeStatus: status } : option,
            ),
          })),
        ),
    },
  )

  function toggleOption(optionId: number, checked: boolean): void {
    void run(optionId, checked ? OPTION_STORE_ACTIVE : OPTION_STORE_DISABLED)
  }

  return {
    target,
    items: data ?? EMPTY_ITEMS,
    loading,
    toggling: pending,
    open: setTarget,
    close: () => setTarget(null),
    toggleOption,
  }
}
