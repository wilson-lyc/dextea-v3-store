import { z } from 'zod'

export const loginResponseSchema = z.object({
  storeId: z.string(),
  token: z.string(),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>
