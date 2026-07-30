import type { FastifyError, FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { BizError } from '@/shared/errors/biz-error.js'
import { logger } from '@/shared/utils/logger.js'

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler<FastifyError>((error, _request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      const messages = (error.validation ?? []).map((item) => item.message ?? '')
      return reply.send({
        code: 400,
        message: messages.join('; '),
        data: null,
      })
    }

    if (error instanceof BizError) {
      return reply.send({
        code: error.code,
        message: error.message,
        data: null,
      })
    }

    logger.error('未处理的异常', error)
    return reply.send({
      code: 500,
      message: error.message || '服务器内部错误',
      data: null,
    })
  })
}
