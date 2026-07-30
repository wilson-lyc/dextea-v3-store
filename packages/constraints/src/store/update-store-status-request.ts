import { z } from 'zod'
import { storeStatusCode } from '../enums/index.js'

export const updateStoreStatusRequestSchema = z.object({
  status: z
    .number()
    .int()
    .refine((val) => Object.values(storeStatusCode).includes(val as 0 | 1 | 2 | 3), {
      message: '门店状态值无效',
    }),
})

export type UpdateStoreStatusRequest = z.infer<typeof updateStoreStatusRequestSchema>
