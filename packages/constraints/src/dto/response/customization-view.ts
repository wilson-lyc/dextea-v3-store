import { z } from 'zod'
import {
  CustomizationItemStatus,
  CustomizationOptionGlobalStatus,
  CustomizationOptionStoreStatus,
} from '../../enums/index.js'

export const customizationOptionViewSchema = z.object({
  id: z.number().int(),
  itemId: z.number().int(),
  name: z.string(),
  price: z.number(),
  sort: z.number().int(),
  status: CustomizationOptionGlobalStatus.schema(),
  storeStatus: CustomizationOptionStoreStatus.schema(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CustomizationOptionView = z.infer<typeof customizationOptionViewSchema>

export const customizationItemViewSchema = z.object({
  id: z.number().int(),
  productId: z.number().int(),
  name: z.string(),
  sort: z.number().int(),
  status: CustomizationItemStatus.schema(),
  options: z.array(customizationOptionViewSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CustomizationItemView = z.infer<typeof customizationItemViewSchema>
