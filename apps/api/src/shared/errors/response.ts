import { SUCCESS_CODE, SUCCESS_MESSAGE, type ApiResponse } from '../types/api-response.js'
import { BizError } from './biz-error.js'

export function success<T>(data: T): ApiResponse<T> {
  return {
    code: SUCCESS_CODE,
    message: SUCCESS_MESSAGE,
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
