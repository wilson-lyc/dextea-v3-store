import { logger } from "@/lib/logger"
import { clearToken, getToken } from "@/lib/session"

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

type RequestOptions = Omit<RequestInit, "body" | "headers"> & {
  headers?: Record<string, string>
  body?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: number

  constructor(status: number, message: string, code?: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
  }
}

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  const token = getToken()
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`
  }

  logger.debug(`[请求] ${method} ${path}`, body ?? "")

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      ...rest,
    })
  } catch (error) {
    logger.error(`[网络异常] ${method} ${path}`, error)
    throw new ApiError(0, "网络异常，请检查网络连接")
  }

  if (response.status === 401) {
    logger.warn(`[未授权] ${method} ${path}，清除 Token 并跳转登录页`)
    clearToken()
    if (window.location.pathname !== "/login") {
      window.location.replace("/login")
    }
    throw new ApiError(401, "登录已失效，请重新登录")
  }

  if (response.status === 204) {
    logger.debug(`[响应] ${method} ${path} 204`)
    return undefined as T
  }

  const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok) {
    const message = envelope?.message ?? "请求失败，请稍后重试"
    logger.error(`[请求失败] ${method} ${path} ${response.status}`, message)
    throw new ApiError(response.status, message, envelope?.code)
  }

  logger.debug(`[响应] ${method} ${path} ${response.status}`, envelope?.data)
  return envelope ? envelope.data : (undefined as T)
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, options),
}
