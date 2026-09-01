import { z } from 'zod'
import { CustomizationOptionStoreStatus } from '../../enums/index.js'

export const updateCustomizationOptionStoreStatusRequestSchema = z.object({
  status: CustomizationOptionStoreStatus.schema(),
})

export type UpdateCustomizationOptionStoreStatusRequest = z.infer<
  typeof updateCustomizationOptionStoreStatusRequestSchema
>
