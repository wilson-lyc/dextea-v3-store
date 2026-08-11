import { toProductView, type ProductView } from '@/product/mapper/product-mapper.js'
import { productRepository } from '@/product/repository/product-repository.js'

export class ListActiveProductsService {
  async execute(): Promise<ProductView[]> {
    const products = await productRepository.findGloballyActive()
    return products.map(toProductView)
  }
}

export const listActiveProductsService = new ListActiveProductsService()
