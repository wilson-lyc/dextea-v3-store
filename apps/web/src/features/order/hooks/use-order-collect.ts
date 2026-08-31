import { OrderMakingStatus } from "@dextea/constraints"

import { useMutation } from "@/shared/hooks/use-mutation"
import { markOrderCollected } from "@/features/order/api"
import type { Order } from "@/features/order/model"

interface UseOrderCollectOptions {
  setOrders: (updater: (prev: Order[] | undefined) => Order[]) => void
  reloadDetail: () => void
}

export function useOrderCollect({ setOrders, reloadDetail }: UseOrderCollectOptions) {
  return useMutation(
    async (order: Order) => {
      await markOrderCollected(Number(order.id))
      return order
    },
    {
      successMessage: "已确认取餐",
      errorMessage: "确认取餐失败，请稍后重试",
      onSuccess: (order) => {
        setOrders((prev) =>
          (prev ?? []).map((item) =>
            item.id === order.id
              ? { ...item, makingStatus: OrderMakingStatus.keyMap.COLLECTED }
              : item,
          ),
        )
        reloadDetail()
      },
    },
  )
}
