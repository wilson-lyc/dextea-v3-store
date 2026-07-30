export interface JwtUserClaims {
  storeId: string
}

export interface VerifiedToken extends JwtUserClaims {
  iat: number
  exp: number
}

export interface TokenProvider {
  generateToken(claims: JwtUserClaims): { token: string; expiresIn: number }
  verifyToken(token: string): VerifiedToken
}
