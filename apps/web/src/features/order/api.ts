import {
  apiRoutes,
  type OrderDetailData,
  type OrderMakingBoardData,
  type OrderWindowData,
} from "@dextea/constraints"

import { http } from "@/shared/api/client"

export type {
  OrderDetailData,
  OrderDetailItem,
  OrderMakingBoardData,
  OrderWindowData,
  OrderWindowItem,
} from "@dextea/constraints"

export function fetchOrderWindow(): Promise<OrderWindowData> {
  return http.get<OrderWindowData>(apiRoutes.order.window())
}

export function fetchMakingBoard(): Promise<OrderMakingBoardData> {
  return http.get<OrderMakingBoardData>(apiRoutes.order.makingBoard())
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
