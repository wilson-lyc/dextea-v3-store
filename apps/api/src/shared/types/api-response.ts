import { BizError } from '@/shared/errors/biz-error.js'

export const SUCCESS_CODE = 0
export const SUCCESS_MESSAGE = 'success'

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export function success<T>(data: T): ApiResponse<T>
export function success<T>(data: T, message: string): ApiResponse<T>
export function success<T>(data: T, message?: string): ApiResponse<T> {
  return {
    code: SUCCESS_CODE,
    message: message ?? SUCCESS_MESSAGE,
    data,
  }
}

export function toApiResponse(error: BizError): ApiResponse {
  return {
    code: error.code,
    message: error.message,
    data: null,
  }
}
