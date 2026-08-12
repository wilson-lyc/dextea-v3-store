import type { ProductGlobalStatusCode, ProductStoreStatusCode } from '@dextea/constraints'
import type { Product } from '@/model/product.js'

export interface ProductView {
  id: number
  name: string
  description: string | null
  price: number
  image: string | null
  status: ProductGlobalStatusCode
  storeStatus: ProductStoreStatusCode
  createdAt: string
  updatedAt: string
}

export function toProductView(product: Product, storeStatus: ProductStoreStatusCode): ProductView {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    status: product.status,
    storeStatus,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}
