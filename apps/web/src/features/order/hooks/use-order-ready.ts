import { OrderMakingStatus } from "@dextea/constraints"

import { useMutation } from "@/shared/hooks/use-mutation"
import { markOrderReady } from "@/features/order/api"
import type { Order } from "@/features/order/model"

interface UseOrderReadyOptions {
  setOrders: (updater: (prev: Order[] | undefined) => Order[]) => void
  reloadDetail: () => void
}

export function useOrderReady({ setOrders, reloadDetail }: UseOrderReadyOptions) {
  return useMutation(
    async (order: Order) => {
      await markOrderReady(Number(order.id))
      return order
    },
    {
      successMessage: "已标记制作完成",
      errorMessage: "标记制作完成失败，请稍后重试",
      onSuccess: (order) => {
        setOrders((prev) =>
          (prev ?? []).map((item) =>
            item.id === order.id
              ? { ...item, makingStatus: OrderMakingStatus.keyMap.READY }
              : item,
          ),
        )
        reloadDetail()
      },
    },
  )
}
