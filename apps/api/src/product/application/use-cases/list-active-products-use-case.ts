import type { ProductRepositoryPort } from '@/product/domain/repositories/product-repository-port.js'
import { toProductView, type ProductView } from '@/product/application/dtos/product-dto.js'

export class ListActiveProductsUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(): Promise<ProductView[]> {
    const products = await this.productRepository.findGloballyActive()
    return products.map(toProductView)
  }
}
