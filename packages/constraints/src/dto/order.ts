import { z } from 'zod'

export type DiningMethod = 1 | 2 | 3
export type MakingStatus = number
export type PaymentStatus = number

export const orderWindowItemSchema = z.object({
  orderId: z.number().int(),
  orderNo: z.string(),
  pickupCode: z.string(),
  totalPrice: z.number(),
  totalQuantity: z.number().int(),
  diningMethod: z.number().int(),
  makingStatus: z.number().int(),
  paymentStatus: z.number().int(),
  createdAt: z.string(),
})

export type OrderWindowItem = z.infer<typeof orderWindowItemSchema>

export const orderWindowDataSchema = z.object({
  items: z.array(orderWindowItemSchema),
  total: z.number().int(),
})

export type OrderWindowData = z.infer<typeof orderWindowDataSchema>

export const orderDetailItemSchema = z.object({
  id: z.number().int().nullable(),
  productId: z.number().int(),
  productName: z.string(),
  skuId: z.string(),
  customization: z.string().nullable(),
  coverUrl: z.string().nullable(),
  quantity: z.number().int(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  available: z.boolean(),
})

export type OrderDetailItem = z.infer<typeof orderDetailItemSchema>

export const orderDetailDataSchema = z.object({
  id: z.number().int(),
  orderNo: z.string(),
  tradeNo: z.string(),
  storeId: z.number().int(),
  diningMethod: z.number().int(),
  note: z.string().nullable(),
  source: z.number().int(),
  pickupCode: z.string(),
  makingStatus: z.number().int(),
  paymentMethod: z.number().int(),
  paymentStatus: z.number().int(),
  paymentExpiredAt: z.string().nullable(),
  paymentPaidAt: z.string().nullable(),
  paymentRefundedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  totalPrice: z.number(),
  totalQuantity: z.number().int(),
  items: z.array(orderDetailItemSchema),
})

export type OrderDetailData = z.infer<typeof orderDetailDataSchema>

export function upstreamEnvelopeSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    code: z.number(),
    message: z.string(),
    data: dataSchema,
  })
}

export const orderWindowResponseSchema = upstreamEnvelopeSchema(orderWindowDataSchema)

export type OrderWindowResponse = z.infer<typeof orderWindowResponseSchema>

export const orderDetailResponseSchema = upstreamEnvelopeSchema(orderDetailDataSchema)

export type OrderDetailResponse = z.infer<typeof orderDetailResponseSchema>
