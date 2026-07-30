import type { FastifyError, FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { BizError } from '../errors/biz-error.js'
import { toApiResponse } from '../errors/response.js'
import type { ApiResponse } from '../types/api-response.js'

const VALIDATION_ERROR_CODE = 400
const SYSTEM_ERROR_CODE = 500
const SYSTEM_ERROR_MESSAGE = '服务器异常，请稍后重试'

function buildZodMessage(error: ZodError): string {
  if (error.issues.length === 0) {
    return error.message
  }
  return error.issues
    .map((issue) => {
      const path = issue.path.join('.')
      return path ? `${path}: ${issue.message}` : issue.message
    })
    .join('; ')
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error instanceof ZodError) {
      const body: ApiResponse = {
        code: VALIDATION_ERROR_CODE,
        message: buildZodMessage(error),
        data: null,
      }
      return reply.code(VALIDATION_ERROR_CODE).send(body)
    }

    if (BizError.isBizError(error)) {
      return reply.code(200).send(toApiResponse(error))
    }

    app.log.error(error)
    const body: ApiResponse = {
      code: SYSTEM_ERROR_CODE,
      message: SYSTEM_ERROR_MESSAGE,
      data: null,
    }
    return reply.code(SYSTEM_ERROR_CODE).send(body)
  })
}
