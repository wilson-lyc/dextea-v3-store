import {
  apiRoutes,
  type OrderDetailData,
  type OrderWindowData,
} from "@dextea/constraints"

import { http } from "./request"

export type {
  OrderDetailData,
  OrderDetailItem,
  OrderWindowData,
  OrderWindowItem,
} from "@dextea/constraints"

export async function fetchOrderWindow(): Promise<OrderWindowData> {
  return http.get<OrderWindowData>(apiRoutes.order.window())
}

export async function fetchOrderDetail(orderId: number): Promise<OrderDetailData> {
  return http.get<OrderDetailData>(apiRoutes.order.detail(orderId))
}
