import { eq } from 'drizzle-orm'
import { StoreStatus, type StoreStatusCode } from '@dextea/constraints'
import type { Database } from '@/infrastructure/database/pool.js'
import { stores } from '@/infrastructure/database/schema/stores.js'
import { Store } from './store.model.js'

export interface StoreRepository {
  findById(id: number): Promise<Store | null>
  findByAccount(account: string): Promise<Store | null>
  updateStatus(id: number, status: StoreStatusCode): Promise<boolean>
  updatePassword(id: number, passwordHash: string): Promise<boolean>
}

export class DrizzleStoreRepository implements StoreRepository {
  public constructor(private readonly db: Database) {}

  public async findById(id: number): Promise<Store | null> {
    const [row] = await this.db.select().from(stores).where(eq(stores.id, id)).limit(1)
    return row ? this.toModel(row) : null
  }

  public async findByAccount(account: string): Promise<Store | null> {
    const [row] = await this.db.select().from(stores).where(eq(stores.account, account)).limit(1)
    return row ? this.toModel(row) : null
  }

  public async updateStatus(id: number, status: StoreStatusCode): Promise<boolean> {
    const [result] = await this.db
      .update(stores)
      .set({ status })
      .where(eq(stores.id, id))

    return result.affectedRows > 0
  }

  public async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    const [result] = await this.db
      .update(stores)
      .set({ password: passwordHash })
      .where(eq(stores.id, id))

    return result.affectedRows > 0
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
      StoreStatus.schema().parse(row.status),
      row.businessHours,
      row.phone,
      row.longitude,
      row.latitude,
      row.email,
      row.createdAt,
      row.updatedAt,
    )
  }
}
