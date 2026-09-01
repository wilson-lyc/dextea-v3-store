import { z, type ZodType } from 'zod'

export const SUCCESS_CODE = 'OK'

export function apiEnvelopeSchema<T extends ZodType>(dataSchema: T) {
  return z.object({
    code: z.string(),
    message: z.string(),
    data: dataSchema,
  })
}

export interface ApiEnvelope<T> {
  code: string
  message: string
  data: T
}
