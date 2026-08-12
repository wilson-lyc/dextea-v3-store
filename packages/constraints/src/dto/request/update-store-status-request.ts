import { z } from 'zod'
import { StoreStatus } from '../../enums/index.js'

export const storeStatusCode = StoreStatus.keyMap

export const updateStoreStatusRequestSchema = z.object({
  status: StoreStatus.schema().refine(
    (val) => val === storeStatusCode.CLOSED || val === storeStatusCode.OPEN,
    { message: '门店状态仅支持休息中或营业中' },
  ),
})

export type UpdateStoreStatusRequest = z.infer<typeof updateStoreStatusRequestSchema>
