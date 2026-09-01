import jwt from 'jsonwebtoken'
import { getConfig } from '@/config/index.js'
import { BizError, commonErrors } from '@/shared/errors.js'

export interface StoreClaims {
  storeId: number
}

export interface GeneratedToken {
  token: string
  expiresInSeconds: number
}

export interface TokenService {
  generateToken(claims: StoreClaims): GeneratedToken
  verifyToken(token: string): StoreClaims
}

export class JwtTokenService implements TokenService {
  private readonly secret: string
  private readonly expiresIn: string

  public constructor(
    secret: string = getConfig().jwt.secret,
    expiresIn: string = getConfig().jwt.expiresIn
  ) {
    this.secret = secret
    this.expiresIn = expiresIn
  }

  public generateToken(claims: StoreClaims): GeneratedToken {
    const token = jwt.sign({ storeId: String(claims.storeId) }, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
    })

    const decoded = jwt.decode(token) as { iat: number; exp: number } | null
    const expiresInSeconds = decoded ? decoded.exp - decoded.iat : 0

    return { token, expiresInSeconds }
  }

  public verifyToken(token: string): StoreClaims {
    let payload: unknown

    try {
      payload = jwt.verify(token, this.secret)
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new BizError(commonErrors.TOKEN_EXPIRED)
      }
      throw new BizError(commonErrors.TOKEN_INVALID)
    }

    return this.parseClaims(payload)
  }

  private parseClaims(payload: unknown): StoreClaims {
    if (typeof payload !== 'object' || payload === null) {
      throw new BizError(commonErrors.TOKEN_INVALID)
    }

    const rawStoreId = (payload as { storeId?: unknown }).storeId
    const storeId = typeof rawStoreId === 'number' ? rawStoreId : Number(rawStoreId)

    if (!Number.isInteger(storeId) || storeId <= 0) {
      throw new BizError(commonErrors.TOKEN_INVALID)
    }

    return { storeId }
  }
}
