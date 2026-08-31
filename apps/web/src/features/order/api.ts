import {
  apiRoutes,
  type OrderDetailData,
  type OrderWindowData,
} from "@dextea/constraints"

import { http } from "@/shared/api/client"

export type {
  OrderDetailData,
  OrderDetailItem,
  OrderWindowData,
  OrderWindowItem,
} from "@dextea/constraints"

export function fetchOrderWindow(): Promise<OrderWindowData> {
  return http.get<OrderWindowData>(apiRoutes.order.window())
}

export function fetchOrderDetail(orderId: number): Promise<OrderDetailData> {
  return http.get<OrderDetailData>(apiRoutes.order.detail(orderId))
}

export function markOrderReady(orderId: number): Promise<null> {
  return http.post<null>(apiRoutes.order.ready(orderId))
}

export function markOrderCollected(orderId: number): Promise<null> {
  return http.post<null>(apiRoutes.order.collect(orderId))
}
