import { z } from 'zod'

export const loginRequestSchema = z.object({
  account: z.string().min(1, '账号不能为空'),
  password: z.string().min(1, '密码不能为空'),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>
