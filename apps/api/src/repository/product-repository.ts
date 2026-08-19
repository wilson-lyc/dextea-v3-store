import { and, eq, inArray } from 'drizzle-orm'
import type { Database } from '@/shared/database/index.js'
import { products, productStoreStatus } from '@/shared/database/schema.js'
import { Product } from '@/model/product.js'
import type { ProductGlobalStatusCode } from '@dextea/constraints'
import { productStoreStatusCode } from '@dextea/constraints'

export class ProductRepository {
  public constructor(private readonly db: Database) {}

  public async findGloballyActive(): Promise<Product[]> {
    const rows = await this.db
      .select()
      .from(products)
      .where(eq(products.status, 1))
      .orderBy(products.id)

    return rows.map((row) => this.toModel(row))
  }

  public async findStoreStatusByStoreId(
    storeId: number,
    productIds: number[],
  ): Promise<Map<number, number>> {
    const result = new Map<number, number>()
    for (const productId of productIds) {
      result.set(productId, productStoreStatusCode.STORE_DISABLED)
    }

    if (productIds.length === 0) {
      return result
    }

    const rows = await this.db
      .select()
      .from(productStoreStatus)
      .where(
        and(
          eq(productStoreStatus.storeId, storeId),
          inArray(productStoreStatus.productId, productIds),
        ),
      )

    for (const row of rows) {
      result.set(Number(row.productId), Number(row.status))
    }

    return result
  }

  public async setStoreStatus(storeId: number, productId: number, status: number): Promise<void> {
    await this.db
      .insert(productStoreStatus)
      .values({ storeId, productId, status })
      .onDuplicateKeyUpdate({ set: { status } })
  }

  public async batchSetStoreStatus(
    storeId: number,
    productIds: number[],
    status: number,
  ): Promise<void> {
    if (productIds.length === 0) return
    await this.db
      .insert(productStoreStatus)
      .values(productIds.map((productId) => ({ storeId, productId, status })))
      .onDuplicateKeyUpdate({ set: { status } })
  }

  private toModel(row: typeof products.$inferSelect): Product {
    return new Product(
      row.id,
      row.name,
      row.description,
      Number(row.price),
      row.status as ProductGlobalStatusCode,
      row.createdAt,
      row.updatedAt,
    )
  }
}
