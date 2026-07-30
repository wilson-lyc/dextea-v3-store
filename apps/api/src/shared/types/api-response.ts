export const SUCCESS_CODE = 0
export const SUCCESS_MESSAGE = 'success'

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T | null
}
