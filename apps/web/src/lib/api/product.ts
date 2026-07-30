import { http } from "./request"

export interface ProductView {
  id: number
  name: string
  description: string | null
  price: number
  image: string | null
  status: number
  createdAt: string
  updatedAt: string
}

export const productApi = {
  listActive(): Promise<ProductView[]> {
    return http.get<ProductView[]>("/api/v1/products/")
  },
}
