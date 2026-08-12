import { BizErrorCode } from './biz-error-code.js'

export class BizError extends Error {
  public readonly code: number
  public readonly errorCode?: BizErrorCode

  constructor(errorCode: BizErrorCode, message?: string)
  constructor(code: number, message: string)
  constructor(codeOrErrorCode: BizErrorCode | number, message?: string) {
    let code: number
    let errorCode: BizErrorCode | undefined
    let finalMessage: string

    if (codeOrErrorCode instanceof BizErrorCode) {
      code = codeOrErrorCode.code
      errorCode = codeOrErrorCode
      finalMessage = message ?? codeOrErrorCode.message
    } else {
      code = codeOrErrorCode
      finalMessage = message ?? ''
    }

    super(finalMessage)
    this.name = 'BizError'
    this.code = code
    this.errorCode = errorCode
  }

  public static isBizError(error: unknown): error is BizError {
    return error instanceof BizError
  }
}
