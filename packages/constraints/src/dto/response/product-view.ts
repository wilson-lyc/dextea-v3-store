import { z } from 'zod'
import { ProductGlobalStatus, ProductStoreStatus } from '../../enums/index.js'

export const productViewSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  status: ProductGlobalStatus.schema(),
  storeStatus: ProductStoreStatus.schema(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ProductView = z.infer<typeof productViewSchema>
