import { eq } from 'drizzle-orm'
import type { Database } from '@/shared/database/index.js'
import { stores } from '@/shared/database/schema.js'
import { Store } from '@/model/store.js'
import type { StoreStatusCode } from '@dextea/constraints'

export class StoreRepository {
  public constructor(private readonly db: Database) {}

  public async findById(id: number): Promise<Store | null> {
    const [row] = await this.db.select().from(stores).where(eq(stores.id, id)).limit(1)
    return row ? this.toModel(row) : null
  }

  public async findByAccount(account: string): Promise<Store | null> {
    const [row] = await this.db.select().from(stores).where(eq(stores.account, account)).limit(1)
    return row ? this.toModel(row) : null
  }

  public async updateStatus(id: number, status: number): Promise<void> {
    await this.db.update(stores).set({ status }).where(eq(stores.id, id))
  }

  public async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.db
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
      row.createdAt,
      row.updatedAt,
    )
  }
}
