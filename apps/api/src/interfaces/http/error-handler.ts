import type { FastifyError, FastifyInstance } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod'
import { BizError, commonErrors } from '@/shared/errors.js'
import { getLogger } from '@/shared/logger.js'
import { failure } from './response.js'

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler<FastifyError>((error, request, reply) => {
    const logger = getLogger()

    if (hasZodFastifySchemaValidationErrors(error)) {
      const message = error.validation
        .map((item) => item.message ?? '')
        .filter((item) => item !== '')
        .join('; ')

      const validation = commonErrors.VALIDATION_FAILED
      return reply
        .code(validation.status)
        .send(failure(validation.code, message || validation.message))
    }

    if (isResponseSerializationError(error)) {
      logger.error(
        { err: error.cause, method: error.method, url: error.url },
        '[http] 响应序列化失败',
      )
      const internal = commonErrors.INTERNAL_ERROR
      return reply.code(internal.status).send(failure(internal.code, internal.message))
    }

    if (BizError.isBizError(error)) {
      return reply.code(error.status).send(failure(error.code, error.message))
    }

    const statusCode = error.statusCode ?? 500

    if (statusCode >= 500) {
      logger.error({ err: error, url: request.url }, '[http] 未处理的异常')
      const internal = commonErrors.INTERNAL_ERROR
      return reply.code(internal.status).send(failure(internal.code, internal.message))
    }

    const validation = commonErrors.VALIDATION_FAILED
    return reply
      .code(statusCode)
      .send(failure(validation.code, error.message || validation.message))
  })

  app.setNotFoundHandler(async (_request, reply) => {
    const notFound = commonErrors.ROUTE_NOT_FOUND
    return reply.code(notFound.status).send(failure(notFound.code, notFound.message))
  })
}
