import argon2 from 'argon2'

export async function verifyPassword(plaintextPassword: string, storedHash: string): Promise<boolean> {
  try {
    return await argon2.verify(storedHash, plaintextPassword)
  } catch {
    return false
  }
}
