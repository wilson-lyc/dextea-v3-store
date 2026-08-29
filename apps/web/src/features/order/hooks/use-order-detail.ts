import { useAsyncData } from "@/shared/hooks/use-async-data"
import { fetchOrderDetail } from "@/features/order/api"
import { mapOrderDetail, type Order } from "@/features/order/model"

export function useOrderDetail(orderId: string | null): Order | null {
  const { data } = useAsyncData<Order | null>(
    async () => {
      if (orderId === null) return null
      return mapOrderDetail(await fetchOrderDetail(Number(orderId)))
    },
    { immediate: orderId !== null, deps: [orderId] },
  )

  return data ?? null
}
