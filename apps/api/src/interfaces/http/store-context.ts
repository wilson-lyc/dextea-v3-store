import type { FastifyRequest } from 'fastify'
import { BizError, commonErrors } from '@/shared/errors.js'

export function requireStoreId(request: FastifyRequest): number {
  const storeId = request.storeId

  if (storeId === undefined) {
    throw new BizError(commonErrors.UNAUTHORIZED)
  }

  return storeId
}

export function requireAuthToken(request: FastifyRequest): string | undefined {
  return request.authToken
}
