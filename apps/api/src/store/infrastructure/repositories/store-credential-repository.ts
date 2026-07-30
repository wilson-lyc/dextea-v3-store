import { eq } from 'drizzle-orm'
import { db } from '@/shared/infrastructure/database/index.js'
import { stores } from '@/drizzle/schema.js'
import type { AuthStorePort, StoreCredential } from '@/auth/domain/ports/auth-store-port.js'

export class StoreCredentialRepository implements AuthStorePort {
  async findByAccount(account: string): Promise<StoreCredential | null> {
    const [store] = await db
      .select({
        id: stores.id,
        account: stores.account,
        password: stores.password,
        status: stores.status,
      })
      .from(stores)
      .where(eq(stores.account, account))
      .limit(1)

    return store ?? null
  }
}

export const storeCredentialRepository = new StoreCredentialRepository()
