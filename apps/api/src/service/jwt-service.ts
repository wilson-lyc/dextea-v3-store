import jwt from 'jsonwebtoken'
import { config } from '@/shared/config.js'
import { BizError } from '@/shared/errors/biz-error.js'
import { StoreErrorCode } from '@/error/store-error.js'
import type {
  JwtUserClaims,
  TokenService,
  VerifiedToken,
} from '@/service/token-service.js'

export class JwtService implements TokenService {
  private readonly secret: string
  private readonly expiresIn: string

  constructor(secret: string = config.jwt.secret, expiresIn: string = config.jwt.expiresIn) {
    this.secret = secret
    this.expiresIn = expiresIn
  }

  generateToken(claims: JwtUserClaims): { token: string; expiresIn: number } {
    const token = jwt.sign(claims, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
    })
    const decoded = jwt.decode(token) as { iat: number; exp: number } | null
    const expiresIn = decoded ? decoded.exp - decoded.iat : 0
    return { token, expiresIn }
  }

  verifyToken(token: string): VerifiedToken {
    try {
      return jwt.verify(token, this.secret) as VerifiedToken
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new BizError(StoreErrorCode.INVALID_TOKEN, '令牌已过期，请重新登录')
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BizError(StoreErrorCode.INVALID_TOKEN)
      }
      throw error
    }
  }
}

export const jwtService = new JwtService()
