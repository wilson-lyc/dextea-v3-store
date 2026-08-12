import type { ProductGlobalStatusCode } from '@dextea/constraints'
import type { Product } from '@/model/product.js'

export interface ProductView {
  id: number
  name: string
  description: string | null
  price: number
  image: string | null
  status: ProductGlobalStatusCode
  createdAt: string
  updatedAt: string
}

export function toProductView(product: Product): ProductView {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}
