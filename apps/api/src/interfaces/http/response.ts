import { SUCCESS_CODE, type ApiEnvelope } from '@dextea/constraints'

export const SUCCESS_MESSAGE = 'success'

export function success<T>(data: T, message: string = SUCCESS_MESSAGE): ApiEnvelope<T> {
  return {
    code: SUCCESS_CODE,
    message,
    data,
  }
}

export function failure(code: string, message: string): ApiEnvelope<null> {
  return {
    code,
    message,
    data: null,
  }
}
