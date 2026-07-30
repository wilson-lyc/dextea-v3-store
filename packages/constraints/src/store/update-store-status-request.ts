import { z } from 'zod'
import { storeStatusCode } from '../enums/index.js'

export const updateStoreStatusRequestSchema = z.object({
  status: z
    .number()
    .int()
    .refine(
      (val) => val === storeStatusCode.CLOSED || val === storeStatusCode.OPEN,
      { message: '门店状态仅支持休息中或营业中' },
    ),
})

export type UpdateStoreStatusRequest = z.infer<typeof updateStoreStatusRequestSchema>
