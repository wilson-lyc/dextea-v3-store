import { toProductView, type ProductView } from '@/mapper/product-mapper.js'
import type { ProductRepository } from '@/repository/product-repository.js'
import { productStoreStatusCode } from '@dextea/constraints'
import type { ProductStoreStatusCode } from '@dextea/constraints'

export class ProductService {
  public constructor(private readonly productRepository: ProductRepository) {}

  public async listActiveByStore(storeId: number): Promise<ProductView[]> {
    const products = await this.productRepository.findGloballyActive()
    const storeStatusMap = await this.productRepository.findStoreStatusByStoreId(
      storeId,
      products.map((product) => product.id),
    )

    return products.map((product) =>
      toProductView(product, storeStatusMap.get(product.id) as ProductStoreStatusCode),
    )
  }

  public async toggleStoreStatus(
    storeId: number,
    productId: number,
  ): Promise<ProductStoreStatusCode> {
    const current = await this.productRepository.findStoreStatusByStoreId(storeId, [productId])
    const next =
      current.get(productId) === productStoreStatusCode.STORE_ACTIVE
        ? productStoreStatusCode.STORE_DISABLED
        : productStoreStatusCode.STORE_ACTIVE
    await this.productRepository.setStoreStatus(storeId, productId, next)
    return next
  }

  public async batchSetStoreStatus(
    storeId: number,
    productIds: number[],
    status: ProductStoreStatusCode,
  ): Promise<void> {
    await this.productRepository.batchSetStoreStatus(storeId, productIds, status)
  }
}
