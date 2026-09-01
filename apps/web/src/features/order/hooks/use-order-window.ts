import { useAsyncData } from "@/shared/hooks/use-async-data"
import { fetchOrderWindow } from "@/features/order/api"
import { mapOrderWindowItem, type Order } from "@/features/order/model"

const EMPTY_ORDERS: Order[] = []

export interface OrderWindow {
  orders: Order[]
  loading: boolean
  reload: () => void
  setOrders: (updater: (prev: Order[] | undefined) => Order[]) => void
}

export function useOrderWindow(): OrderWindow {
  const { data, loading, reload, setData } = useAsyncData<Order[]>(async () => {
    const result = await fetchOrderWindow()
    return result.items.map(mapOrderWindowItem)
  })

  return {
    orders: data ?? EMPTY_ORDERS,
    loading,
    reload,
    setOrders: setData as (updater: (prev: Order[] | undefined) => Order[]) => void,
  }
}
