import type { FastifyReply, FastifyRequest } from 'fastify'
import type { AuthService } from '@/service/auth-service.js'

const BEARER_PREFIX = 'Bearer '

export function createStoreIdInterceptor(tokenProvider: AuthService) {
  return async function storeIdInterceptor(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const authHeader = request.headers['authorization']
    if (!authHeader || typeof authHeader !== 'string') {
      return
    }

    const token = authHeader.startsWith(BEARER_PREFIX)
      ? authHeader.slice(BEARER_PREFIX.length)
      : authHeader
    if (!token) {
      return
    }

    const claims = tokenProvider.verifyToken(token)
    request.headers['x-store-id'] = String(claims.storeId)
  }
}
