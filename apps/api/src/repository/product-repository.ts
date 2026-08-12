import { eq } from 'drizzle-orm'
import { db } from '@/shared/database/index.js'
import { products } from '@/shared/database/schema.js'
import { Product } from '@/model/product.js'
import type { ProductGlobalStatusCode } from '@dextea/constraints'

export class ProductRepository {
  async findGloballyActive(): Promise<Product[]> {
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.status, 1))
      .orderBy(products.id)

    return rows.map((row) => this.toModel(row))
  }

  private toModel(row: typeof products.$inferSelect): Product {
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
