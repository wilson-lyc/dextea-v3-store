import { z } from 'zod'

export const resetPasswordRequestSchema = z
  .object({
    oldPassword: z.string().min(1, '原密码不能为空'),
    newPassword: z.string().min(6, '新密码至少 6 位').max(64, '新密码不能超过 64 位'),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: '新密码不能与原密码相同',
    path: ['newPassword'],
  })

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>
