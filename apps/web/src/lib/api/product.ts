import { http } from "./request"

export interface ProductView {
  id: number
  name: string
  description: string | null
  price: number
  image: string | null
  status: number
  storeStatus: number
  createdAt: string
  updatedAt: string
}

export interface CustomizationOptionView {
  id: number
  itemId: number
  name: string
  price: number
  sort: number
  status: number
  storeStatus: number
  createdAt: string
  updatedAt: string
}

export interface CustomizationItemView {
  id: number
  productId: number
  name: string
  sort: number
  status: number
  options: CustomizationOptionView[]
  createdAt: string
  updatedAt: string
}

export const productApi = {
  listActive(): Promise<ProductView[]> {
    return http.get<ProductView[]>("/api/v1/products/")
  },
  toggleStoreStatus(id: number): Promise<{ storeStatus: number }> {
    return http.patch<{ storeStatus: number }>(`/api/v1/products/${id}/store-status`, {})
  },
  batchSetStoreStatus(productIds: number[], status: number): Promise<null> {
    return http.post<null>("/api/v1/products/batch/store-status", { productIds, status })
  },
  listCustomizations(productId: number): Promise<CustomizationItemView[]> {
    return http.get<CustomizationItemView[]>(`/api/v1/products/${productId}/customizations`)
  },
  updateOptionStoreStatus(optionId: number, status: number): Promise<{ storeStatus: number }> {
    return http.patch<{ storeStatus: number }>(
      `/api/v1/products/customizations/options/${optionId}/store-status`,
      { status },
    )
  },
}
