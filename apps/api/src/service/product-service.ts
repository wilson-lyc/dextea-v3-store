import { toProductView, type ProductView } from '@/mapper/product-mapper.js'
import { productRepository } from '@/repository/product-repository.js'
import { productStoreStatusCode } from '@dextea/constraints'
import type { ProductStoreStatusCode } from '@dextea/constraints'

export class ProductService {
  async listActiveByStore(storeId: number): Promise<ProductView[]> {
    const products = await productRepository.findGloballyActive()
    const storeStatusMap = await productRepository.findStoreStatusByStoreId(
      storeId,
      products.map((product) => product.id),
    )

    return products.map((product) =>
      toProductView(product, storeStatusMap.get(product.id) as ProductStoreStatusCode),
    )
  }

  async toggleStoreStatus(storeId: number, productId: number): Promise<ProductStoreStatusCode> {
    const current = await productRepository.findStoreStatusByStoreId(storeId, [productId])
    const next =
      current.get(productId) === productStoreStatusCode.STORE_ACTIVE
        ? productStoreStatusCode.STORE_DISABLED
        : productStoreStatusCode.STORE_ACTIVE
    await productRepository.setStoreStatus(storeId, productId, next)
    return next
  }

  async batchSetStoreStatus(
    storeId: number,
    productIds: number[],
    status: ProductStoreStatusCode,
  ): Promise<void> {
    await productRepository.batchSetStoreStatus(storeId, productIds, status)
  }
}

export const productService = new ProductService()
