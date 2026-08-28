import { defineBizErrors } from '@/shared/errors.js'

export const orderErrors = defineBizErrors({
  ORDER_SERVICE_UNAVAILABLE: { status: 502, message: '订单服务暂时不可用，请稍后重试' },
})
