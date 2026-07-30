import type { Product } from '@/product/domain/aggregates/product.js'

export interface ProductRepositoryPort {
  findGloballyActive(): Promise<Product[]>
}
