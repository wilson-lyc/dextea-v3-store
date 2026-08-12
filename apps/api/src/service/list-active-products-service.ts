import { toProductView, type ProductView } from '@/mapper/product-mapper.js'
import { productRepository } from '@/repository/product-repository.js'

export class ListActiveProductsService {
  async execute(): Promise<ProductView[]> {
    const products = await productRepository.findGloballyActive()
    return products.map(toProductView)
  }
}

export const listActiveProductsService = new ListActiveProductsService()
