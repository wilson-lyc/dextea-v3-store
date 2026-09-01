import { productStoreStatusCode, type ProductStoreStatusCode } from '@dextea/constraints'
import { getLogger } from '@/shared/logger.js'
import type { Product } from './product.model.js'
import type { ProductRepository } from './product.repository.js'

export interface ProductWithStoreStatus {
  product: Product
  storeStatus: ProductStoreStatusCode
}

export class ProductService {
  private readonly logger = getLogger()

  public constructor(private readonly productRepository: ProductRepository) {}

  public async listActiveByStore(storeId: number): Promise<ProductWithStoreStatus[]> {
    const products = await this.productRepository.findGloballyActive()
    const storeStatusMap = await this.productRepository.findStoreStatusByStoreId(
      storeId,
      products.map((product) => product.id)
    )

    return products.map((product) => ({
      product,
      storeStatus:
        storeStatusMap.get(product.id) ?? productStoreStatusCode.STORE_DISABLED,
    }))
  }

  public async toggleStoreStatus(
    storeId: number,
    productId: number
  ): Promise<ProductStoreStatusCode> {
    const current = await this.productRepository.findStoreStatusByStoreId(storeId, [
      productId,
    ])
    const next =
      current.get(productId) === productStoreStatusCode.STORE_ACTIVE
        ? productStoreStatusCode.STORE_DISABLED
        : productStoreStatusCode.STORE_ACTIVE

    await this.productRepository.setStoreStatus(storeId, productId, next)

    this.logger.info({ storeId, productId, status: next }, '[product] 商品门店状态已切换')

    return next
  }

  public async batchSetStoreStatus(
    storeId: number,
    productIds: readonly number[],
    status: ProductStoreStatusCode
  ): Promise<void> {
    await this.productRepository.batchSetStoreStatus(storeId, productIds, status)

    this.logger.info(
      { storeId, count: productIds.length, status },
      '[product] 商品门店状态已批量更新'
    )
  }
}
