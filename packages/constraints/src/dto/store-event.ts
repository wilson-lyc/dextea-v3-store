import { z } from 'zod'

export const storeEventTypes = {
  SNAPSHOT: 'snapshot',
  ORDER_STATUS: 'order-status',
} as const

export const orderMakingEventTags = {
  PENDING_TO_PREPARING: 'PENDING_TO_PREPARING',
  PREPARING_TO_READY: 'PREPARING_TO_READY',
} as const

export const orderMakingEventTagSchema = z.enum([
  orderMakingEventTags.PENDING_TO_PREPARING,
  orderMakingEventTags.PREPARING_TO_READY,
])

export const orderStatusEventSchema = z.object({
  tag: orderMakingEventTagSchema,
  orderId: z.number().int(),
  orderNo: z.string(),
  storeId: z.number().int(),
  fromStatus: z.number().int(),
  toStatus: z.number().int(),
  makingStatus: z.number().int(),
  paymentStatus: z.number().int(),
  pickupCode: z.string(),
  totalPrice: z.number(),
  totalQuantity: z.number().int(),
  createdAt: z.string(),
})

export type OrderStatusEvent = z.infer<typeof orderStatusEventSchema>

export const storeSnapshotEventSchema = z.object({
  type: z.literal(storeEventTypes.SNAPSHOT),
  ready: z.array(z.string()),
})

export type StoreSnapshotEvent = z.infer<typeof storeSnapshotEventSchema>

export const storeOrderStatusEventSchema = orderStatusEventSchema.extend({
  type: z.literal(storeEventTypes.ORDER_STATUS),
})

export type StoreOrderStatusEvent = z.infer<typeof storeOrderStatusEventSchema>

export type StoreEvent = StoreSnapshotEvent | StoreOrderStatusEvent
