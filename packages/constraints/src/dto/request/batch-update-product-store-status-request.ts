import { z } from 'zod'
import { ProductStoreStatus } from '../../enums/index.js'

export const batchUpdateProductStoreStatusRequestSchema = z.object({
  productIds: z
    .array(z.number().int().positive({ message: '商品ID无效' }))
    .min(1, { message: 'productIds 必须为非空数字数组' })
    .max(200, { message: '单次批量操作不能超过 200 个商品' }),
  status: ProductStoreStatus.schema(),
})

export type BatchUpdateProductStoreStatusRequest = z.infer<
  typeof batchUpdateProductStoreStatusRequestSchema
>
