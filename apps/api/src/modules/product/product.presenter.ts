import type { ProductStoreStatusCode, ProductView } from '@dextea/constraints'
import type { Product } from './product.model.js'

export function toProductView(
  product: Product,
  storeStatus: ProductStoreStatusCode
): ProductView {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    status: product.status,
    storeStatus,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}
