import { z } from 'zod'
import { CustomizationOptionStoreStatus } from '../../enums/index.js'

export const updateCustomizationOptionStoreStatusRequestSchema = z.object({
  optionId: z.coerce.number().int().positive({ message: '客制化选项ID无效' }),
  storeId: z.coerce.number().int().positive({ message: '门店ID无效' }),
  status: CustomizationOptionStoreStatus.schema(),
})

export type UpdateCustomizationOptionStoreStatusRequest = z.infer<
  typeof updateCustomizationOptionStoreStatusRequestSchema
>
