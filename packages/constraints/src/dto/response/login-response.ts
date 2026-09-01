import { z } from 'zod'
import { storeViewSchema } from './store-view.js'

export const loginResponseSchema = z.object({
  storeId: z.string(),
  token: z.string(),
  store: storeViewSchema,
})

export type LoginResponse = z.infer<typeof loginResponseSchema>
