import { and, eq, inArray } from 'drizzle-orm'
import {
  ProductGlobalStatus,
  ProductStoreStatus,
  productGlobalStatusCode,
  productStoreStatusCode,
  type ProductGlobalStatusCode,
  type ProductStoreStatusCode,
} from '@dextea/constraints'
import type { Database } from '@/infrastructure/database/pool.js'
import {
  productStoreStatus,
  products,
} from '@/infrastructure/database/schema/products.js'
import { buildStoreStatusMap } from '@/shared/store-status.js'
import { Product } from './product.model.js'

export interface ProductRepository {
  findGloballyActive(): Promise<Product[]>
  findStoreStatusByStoreId(
    storeId: number,
    productIds: readonly number[],
  ): Promise<Map<number, ProductStoreStatusCode>>
  setStoreStatus(storeId: number, productId: number, status: ProductStoreStatusCode): Promise<void>
  batchSetStoreStatus(
    storeId: number,
    productIds: readonly number[],
    status: ProductStoreStatusCode,
  ): Promise<void>
}

export class DrizzleProductRepository implements ProductRepository {
  public constructor(private readonly db: Database) {}

  public async findGloballyActive(): Promise<Product[]> {
    const rows = await this.db
      .select()
      .from(products)
      .where(eq(products.status, productGlobalStatusCode.GLOBAL_ACTIVE))
      .orderBy(products.id)

    return rows.map((row) => this.toModel(row))
  }

  public async findStoreStatusByStoreId(
    storeId: number,
    productIds: readonly number[],
  ): Promise<Map<number, ProductStoreStatusCode>> {
    if (productIds.length === 0) {
      return new Map()
    }

    const rows = await this.db
      .select()
      .from(productStoreStatus)
      .where(
        and(
          eq(productStoreStatus.storeId, storeId),
          inArray(productStoreStatus.productId, [...productIds]),
        ),
      )

    return buildStoreStatusMap<ProductStoreStatusCode>(
      productIds,
      productStoreStatusCode.STORE_DISABLED,
      rows.map((row) => [Number(row.productId), row.status] as const),
      (raw) => ProductStoreStatus.schema().parse(raw),
    )
  }

  public async setStoreStatus(
    storeId: number,
    productId: number,
    status: ProductStoreStatusCode,
  ): Promise<void> {
    await this.db
      .insert(productStoreStatus)
      .values({ storeId, productId, status })
      .onDuplicateKeyUpdate({ set: { status } })
  }

  public async batchSetStoreStatus(
    storeId: number,
    productIds: readonly number[],
    status: ProductStoreStatusCode,
  ): Promise<void> {
    if (productIds.length === 0) {
      return
    }

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
      ProductGlobalStatus.schema().parse(row.status) as ProductGlobalStatusCode,
      row.createdAt,
      row.updatedAt,
    )
  }
}
