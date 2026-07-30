import argon2 from 'argon2'

export async function verifyPassword(plaintextPassword: string, storedHash: string): Promise<boolean> {
  try {
    return await argon2.verify(storedHash, plaintextPassword)
  } catch {
    return false
  }
}

export async function hashPassword(plaintextPassword: string): Promise<string> {
  return argon2.hash(plaintextPassword)
}
