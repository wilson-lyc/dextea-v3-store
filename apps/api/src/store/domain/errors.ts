import { BizErrorCode } from '@/shared/errors/biz-error-code.js'

export const StoreErrorCode = {
  STORE_NOT_FOUND: new BizErrorCode(404, '门店不存在'),
  INVALID_TOKEN: new BizErrorCode(401, '无效的令牌，请重新登录'),
  INVALID_CREDENTIALS: new BizErrorCode(401, '账号或密码错误'),
  STORE_DISABLED: new BizErrorCode(403, '门店已停用，无法登录'),
  INVALID_STORE_STATUS: new BizErrorCode(400, '门店状态值无效'),
  STORE_STATUS_UPDATE_BUSY: new BizErrorCode(429, '门店状态正在更新中，请稍后重试'),
  OLD_PASSWORD_INCORRECT: new BizErrorCode(400, '原密码不正确'),
  SAME_AS_OLD_PASSWORD: new BizErrorCode(400, '新密码不能与原密码相同'),
} as const
