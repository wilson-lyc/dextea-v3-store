import { useAsyncData } from "@/shared/hooks/use-async-data"
import { fetchOrderDetail } from "@/features/order/api"
import { mapOrderDetail, type Order } from "@/features/order/model"

export interface OrderDetailResult {
  order: Order | null
  reload: () => void
}

export function useOrderDetail(orderId: string | null): OrderDetailResult {
  const { data, reload } = useAsyncData<Order | null>(
    async () => {
      if (orderId === null) return null
      return mapOrderDetail(await fetchOrderDetail(Number(orderId)))
    },
    { immediate: orderId !== null, deps: [orderId] },
  )

  return { order: data ?? null, reload }
}
