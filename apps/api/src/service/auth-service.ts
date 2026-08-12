import jwt from 'jsonwebtoken'
import { config } from '@/config.js'
import { BizError } from '@/shared/errors/biz-error.js'
import { StoreErrorCode } from '@/error/store-error.js'
import { logger } from '@/shared/utils/logger.js'
import { verifyPassword } from '@/shared/security/password.js'
import { storeRepository } from '@/repository/store-repository.js'
import type { LoginRequest, LoginResponse } from '@dextea/constraints'

export interface JwtUserClaims {
  storeId: string
}

export interface VerifiedToken extends JwtUserClaims {
  iat: number
  exp: number
}

export interface AuthService {
  generateToken(claims: JwtUserClaims): { token: string; expiresIn: number }
  verifyToken(token: string): VerifiedToken
  login(input: LoginRequest): Promise<LoginResponse>
}

export class AuthServiceImpl implements AuthService {
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

  async login(input: LoginRequest): Promise<LoginResponse> {
    const store = await storeRepository.findByAccount(input.account)
    if (!store) {
      throw new BizError(StoreErrorCode.INVALID_CREDENTIALS)
    }

    let passwordMatches: boolean
    try {
      passwordMatches = await verifyPassword(input.password, store.password)
    } catch (error) {
      logger.error('argon2 校验门店密码时发生系统异常', error)
      throw new BizError(StoreErrorCode.INVALID_CREDENTIALS)
    }

    if (!passwordMatches) {
      throw new BizError(StoreErrorCode.INVALID_CREDENTIALS)
    }

    if (!store.isAvailable()) {
      throw new BizError(StoreErrorCode.STORE_DISABLED)
    }

    const { token } = this.generateToken({
      storeId: String(store.id),
    })

    return {
      storeId: String(store.id),
      token,
    }
  }
}

export const authService = new AuthServiceImpl()
