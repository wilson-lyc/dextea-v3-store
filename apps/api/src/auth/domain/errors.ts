import { BizErrorCode } from '@/shared/errors/biz-error-code.js'

export const AuthErrorCode = {
  INVALID_TOKEN: new BizErrorCode(401, '无效的令牌，请重新登录'),
} as const
