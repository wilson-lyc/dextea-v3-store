import { BizErrorCode } from '@/shared/errors/biz-error-code.js'

export const OrderError = {
  ORDER_SERVICE_UNAVAILABLE: new BizErrorCode(502, '订单服务暂时不可用，请稍后重试'),
}
