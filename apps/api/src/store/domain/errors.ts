import { BizErrorCode } from '@/shared/errors/biz-error-code.js'

export const StoreErrorCode = {
  STORE_NOT_FOUND: new BizErrorCode(404, '门店不存在'),
  INVALID_TOKEN: new BizErrorCode(401, '无效的令牌，请重新登录'),
  INVALID_CREDENTIALS: new BizErrorCode(401, '账号或密码错误'),
  STORE_DISABLED: new BizErrorCode(403, '门店已停用，无法登录'),
} as const
