import type { FastifyInstance } from 'fastify'
import { BizError, commonErrors } from '@/shared/errors.js'
import type { TokenService } from '@/modules/auth/token.service.js'
import './type-augmentation.js'

const BEARER_PREFIX = 'Bearer '
const STORE_ID_HEADER = 'x-store-id'

export function extractBearerToken(header: string | undefined): string | undefined {
  if (typeof header !== 'string') {
    return undefined
  }

  const token = header.startsWith(BEARER_PREFIX)
    ? header.slice(BEARER_PREFIX.length)
    : header

  const trimmed = token.trim()
  return trimmed === '' ? undefined : trimmed
}

export function registerAuthGuard(app: FastifyInstance, tokenService: TokenService): void {
  app.addHook('onRequest', async (request) => {
    delete request.headers[STORE_ID_HEADER]

    if (request.routeOptions.config?.publicRoute === true) {
      return
    }

    const token = extractBearerToken(request.headers.authorization)

    if (!token) {
      throw new BizError(commonErrors.UNAUTHORIZED)
    }

    const claims = tokenService.verifyToken(token)

    request.authToken = token
    request.storeId = claims.storeId
  })
}
