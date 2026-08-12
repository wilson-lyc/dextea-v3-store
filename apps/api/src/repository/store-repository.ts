import { eq } from 'drizzle-orm'
import { db } from '@/shared/infrastructure/database/index.js'
import { stores } from '@/drizzle/schema.js'
import { Store } from '@/model/store.js'
import type { StoreStatusCode } from '@dextea/constraints'

export class StoreRepository {
  async findById(id: number): Promise<Store | null> {
    const [row] = await db.select().from(stores).where(eq(stores.id, id)).limit(1)
    return row ? this.toModel(row) : null
  }

  async findByAccount(account: string): Promise<Store | null> {
    const [row] = await db.select().from(stores).where(eq(stores.account, account)).limit(1)
    return row ? this.toModel(row) : null
  }

  async updateStatus(id: number, status: number): Promise<void> {
    await db.update(stores).set({ status }).where(eq(stores.id, id))
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await db
      .update(stores)
      .set({ password: passwordHash })
      .where(eq(stores.id, id))
  }

  private toModel(row: typeof stores.$inferSelect): Store {
    return new Store(
      row.id,
      row.account,
      row.password,
      row.name,
      row.province,
      row.city,
      row.district,
      row.address,
      row.status as StoreStatusCode,
      row.businessHours,
      row.phone,
      Number(row.longitude),
      Number(row.latitude),
      row.email,
      row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    )
  }
}

export const storeRepository = new StoreRepository()
