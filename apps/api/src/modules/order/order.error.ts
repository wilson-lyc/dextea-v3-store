import { defineBizErrors } from '@/shared/errors.js'

export const orderErrors = defineBizErrors({
  ORDER_SERVICE_UNAVAILABLE: { status: 502, message: '订单服务暂时不可用，请稍后重试' },
  ORDER_NOT_FOUND: { status: 400, message: '订单不存在' },
  ORDER_NOT_BELONG_TO_STORE: { status: 400, message: '该订单不属于当前门店' },
  ORDER_MAKING_STATUS_INVALID: {
    status: 400,
    message: '制作状态必须按 待制作→制作中→制作完成→已取餐 逐级变更',
  },
  ORDER_PARAM_INVALID: { status: 400, message: '请求参数不合法' },
  ORDER_UNAUTHORIZED: { status: 401, message: '未登录或登录已失效，请重新登录' },
  ORDER_SYSTEM_BUSY: { status: 500, message: '系统繁忙，请稍后重试' },
  ORDER_UPSTREAM_ERROR: { status: 400, message: '订单服务处理请求失败' },
})
