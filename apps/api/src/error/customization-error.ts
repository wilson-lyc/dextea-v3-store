import { BizErrorCode } from '@/shared/errors/biz-error-code.js'

export const CustomizationErrorCode = {
  OPTION_NOT_FOUND: new BizErrorCode(404, '客制化选项不存在'),
} as const
