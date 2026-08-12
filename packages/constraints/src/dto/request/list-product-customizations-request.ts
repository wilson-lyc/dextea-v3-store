import { z } from 'zod'

export const listProductCustomizationsRequestSchema = z.object({
  productId: z.coerce.number().int().positive({ message: '商品ID无效' }),
  storeId: z.coerce.number().int().positive({ message: '门店ID无效' }),
})

export type ListProductCustomizationsRequest = z.infer<typeof listProductCustomizationsRequestSchema>
