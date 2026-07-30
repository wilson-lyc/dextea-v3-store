import { BizErrorCode } from '@/shared/errors/biz-error-code.js'

export const ProductErrorCode = {
  PRODUCT_NOT_FOUND: new BizErrorCode(404, '商品不存在'),
} as const
