import { getToken } from "@/lib/session"

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

type RequestOptions = Omit<RequestInit, "body" | "headers"> & {
  headers?: Record<string, string>
  body?: unknown
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: number,
  ) {
    super(message)
    this.name = "ApiError"
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    ...rest,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok) {
    const message = envelope?.message ?? "请求失败，请稍后重试"
    throw new ApiError(response.status, message, envelope?.code)
  }

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
