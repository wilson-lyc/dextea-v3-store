import { defineBizErrors } from '@/shared/errors.js'

export const productErrors = defineBizErrors({
  PRODUCT_NOT_FOUND: { status: 404, message: '商品不存在' },
})
