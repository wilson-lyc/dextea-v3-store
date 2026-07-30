import { BizErrorCode } from '@/shared/errors/biz-error-code.js'

export const StoreErrorCode = {
  STORE_NOT_FOUND: new BizErrorCode(404, '门店不存在'),
} as const
