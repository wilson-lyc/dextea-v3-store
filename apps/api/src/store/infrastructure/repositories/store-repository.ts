import { eq } from 'drizzle-orm'
import { db } from '@/shared/infrastructure/database/index.js'
import { stores } from '@/drizzle/schema.js'
import { Store } from '@/store/domain/aggregates/store.js'
import type { StoreRepositoryPort } from '@/store/domain/repositories/store-repository-port.js'

export class StoreRepository implements StoreRepositoryPort {
  async findById(id: number): Promise<Store | null> {
    const [row] = await db.select().from(stores).where(eq(stores.id, id)).limit(1)
    return row ? this.toAggregate(row) : null
  }

  private toAggregate(row: typeof stores.$inferSelect): Store {
    return new Store(
      row.id,
      row.name,
      row.province,
      row.city,
      row.district,
      row.address,
      row.status,
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

export const storeRepository = new StoreRepository()
