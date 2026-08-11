import { toProductView, type ProductView } from '@/product/mapper/product-mapper.js'
import type { ProductRepository } from '@/product/repository/product-repository.js'

export class ListActiveProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(): Promise<ProductView[]> {
    const products = await this.productRepository.findGloballyActive()
    return products.map(toProductView)
  }
}
