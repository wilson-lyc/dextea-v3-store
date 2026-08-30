import argon2 from 'argon2'
import { getLogger } from '@/shared/logger.js'

export async function verifyPassword(
  plaintextPassword: string,
  storedHash: string
): Promise<boolean> {
  try {
    return await argon2.verify(storedHash, plaintextPassword)
  } catch (error) {
    getLogger().warn({ error }, '[security] argon2 校验密码时发生异常')
    return false
  }
}

export async function hashPassword(plaintextPassword: string): Promise<string> {
  return argon2.hash(plaintextPassword)
}
