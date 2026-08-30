import type { FastifyInstance } from 'fastify'
import { BizError, commonErrors } from '@/shared/errors.js'
import type { TokenService } from '@/modules/auth/token.service.js'
import { isPublicRequest, type PublicRouteRule } from './public-routes.js'
import './type-augmentation.js'

const BEARER_PREFIX = 'Bearer '
const STORE_ID_HEADER = 'x-store-id'

export interface AuthGuardOptions {
  publicRoutes?: readonly PublicRouteRule[]
}

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

function resolveRequestPath(url: string): string {
  const queryIndex = url.indexOf('?')
  return queryIndex === -1 ? url : url.slice(0, queryIndex)
}

export function registerAuthGuard(
  app: FastifyInstance,
  tokenService: TokenService,
  options: AuthGuardOptions = {}
): void {
  const rules = options.publicRoutes

  app.addHook('onRequest', async (request) => {
    delete request.headers[STORE_ID_HEADER]

    if (isPublicRequest(request.method, resolveRequestPath(request.url), rules)) {
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
