import { ApiError } from "@/shared/api/client"

const ERROR_CODE_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "未登录或登录已失效，请重新登录",
  TOKEN_INVALID: "无效的令牌，请重新登录",
  TOKEN_EXPIRED: "令牌已过期，请重新登录",
  FORBIDDEN: "没有访问权限",
  VALIDATION_FAILED: "请求参数无效",
  ROUTE_NOT_FOUND: "接口不存在",
  INTERNAL_ERROR: "服务器内部错误",
  STORE_NOT_FOUND: "门店不存在",
  INVALID_STORE_STATUS: "门店状态仅支持休息中或营业中",
  OLD_PASSWORD_INCORRECT: "原密码不正确",
  SAME_AS_OLD_PASSWORD: "新密码不能与原密码相同",
  PRODUCT_NOT_FOUND: "商品不存在",
  OPTION_NOT_FOUND: "客制化选项不存在",
  ORDER_SERVICE_UNAVAILABLE: "订单服务暂时不可用，请稍后重试",
  ORDER_NOT_FOUND: "订单不存在",
  ORDER_NOT_BELONG_TO_STORE: "该订单不属于当前门店",
  ORDER_MAKING_STATUS_INVALID: "制作状态必须按 待制作→制作中→制作完成→已取餐 逐级变更",
  ORDER_PARAM_INVALID: "请求参数不合法",
  ORDER_UNAUTHORIZED: "未登录或登录已失效，请重新登录",
  ORDER_SYSTEM_BUSY: "系统繁忙，请稍后重试",
  ORDER_UPSTREAM_ERROR: "订单服务处理请求失败",
  INVALID_CREDENTIALS: "账号或密码错误",
  STORE_DISABLED: "门店已停用，无法登录",
}

export function resolveErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback
  if (err.status === 0) return "网络异常，请检查网络连接"

  const byCode = err.code ? ERROR_CODE_MESSAGES[err.code] : undefined
  if (byCode) return byCode

  return err.message || fallback
}
