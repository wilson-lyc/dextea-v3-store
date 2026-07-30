export interface JwtUserClaims {
  userId: string
  account: string
  role?: string
  [key: string]: unknown
}

export interface VerifiedToken extends JwtUserClaims {
  iat: number
  exp: number
}

export interface TokenProvider {
  generateToken(claims: JwtUserClaims): { token: string; expiresIn: number }
  verifyToken(token: string): VerifiedToken
}
