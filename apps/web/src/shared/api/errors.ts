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
