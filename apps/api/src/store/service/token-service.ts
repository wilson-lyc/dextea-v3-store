export interface JwtUserClaims {
  storeId: string
}

export interface VerifiedToken extends JwtUserClaims {
  iat: number
  exp: number
}

export interface TokenService {
  generateToken(claims: JwtUserClaims): { token: string; expiresIn: number }
  verifyToken(token: string): VerifiedToken
}
