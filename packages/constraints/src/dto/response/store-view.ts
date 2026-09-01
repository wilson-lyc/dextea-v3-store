import { z } from 'zod'
import { StoreStatus } from '../../enums/index.js'

export const storeViewSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  province: z.string(),
  city: z.string(),
  district: z.string(),
  address: z.string(),
  status: StoreStatus.schema(),
  businessHours: z.string(),
  phone: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  email: z.string(),
  available: z.boolean(),
})

export type StoreView = z.infer<typeof storeViewSchema>
