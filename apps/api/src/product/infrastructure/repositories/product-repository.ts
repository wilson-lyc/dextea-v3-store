import { eq } from 'drizzle-orm'
import { db } from '@/shared/infrastructure/database/index.js'
import { products } from '@/drizzle/schema.js'
import { Product } from '@/product/domain/aggregates/product.js'
import type { ProductRepositoryPort } from '@/product/domain/repositories/product-repository-port.js'
import type { ProductGlobalStatusCode } from '@dextea/constraints'

export class ProductRepository implements ProductRepositoryPort {
  async findGloballyActive(): Promise<Product[]> {
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.status, 1))
      .orderBy(products.id)

    return rows.map((row) => this.toAggregate(row))
  }

  private toAggregate(row: typeof products.$inferSelect): Product {
    return new Product(
      row.id,
      row.name,
      row.description,
      Number(row.price),
      row.image,
      row.status as ProductGlobalStatusCode,
      row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    )
  }
}

export const productRepository = new ProductRepository()
