export interface BizErrorSpec {
  readonly status: number
  readonly message: string
}

export interface BizErrorDefinition {
  readonly code: string
  readonly status: number
  readonly message: string
}

export type BizErrorCatalog<T extends Record<string, BizErrorSpec>> = {
  readonly [K in keyof T]: BizErrorDefinition & { readonly code: K }
}

export function defineBizErrors<const T extends Record<string, BizErrorSpec>>(
  specs: T
): BizErrorCatalog<T> {
  const entries = Object.entries(specs).map(([code, spec]) => [
    code,
    { code, status: spec.status, message: spec.message },
  ])

  return Object.freeze(Object.fromEntries(entries)) as BizErrorCatalog<T>
}

export class BizError extends Error {
  public readonly code: string
  public readonly status: number

  public constructor(definition: BizErrorDefinition, message?: string) {
    super(message ?? definition.message)
    this.name = 'BizError'
    this.code = definition.code
    this.status = definition.status
  }

  public static isBizError(error: unknown): error is BizError {
    return error instanceof BizError
  }
}

export const commonErrors = defineBizErrors({
  UNAUTHORIZED: { status: 401, message: '未登录或登录已失效，请重新登录' },
  TOKEN_INVALID: { status: 401, message: '无效的令牌，请重新登录' },
  TOKEN_EXPIRED: { status: 401, message: '令牌已过期，请重新登录' },
  FORBIDDEN: { status: 403, message: '没有访问权限' },
  VALIDATION_FAILED: { status: 400, message: '请求参数无效' },
  ROUTE_NOT_FOUND: { status: 404, message: '接口不存在' },
  INTERNAL_ERROR: { status: 500, message: '服务器内部错误' },
})
