import { BizErrorCode } from './biz-error-code.js'

export class BizError extends Error {
  public readonly code: number
  public readonly errorCode: BizErrorCode

  constructor(errorCode: BizErrorCode, message?: string) {
    if (!(errorCode instanceof BizErrorCode)) {
      throw new TypeError('BizError must be constructed with a BizErrorCode instance')
    }
    const finalMessage = message ?? errorCode.message
    super(finalMessage)
    this.name = 'BizError'
    this.code = errorCode.code
    this.errorCode = errorCode
  }

  public static isBizError(error: unknown): error is BizError {
    return error instanceof BizError
  }
}
