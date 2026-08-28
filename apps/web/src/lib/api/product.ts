import {
  apiRoutes,
  type CustomizationItemView,
  type CustomizationOptionStoreStatusCode,
  type ProductStoreStatusCode,
  type ProductView,
} from "@dextea/constraints"

import { http } from "./request"

export type {
  CustomizationItemView,
  CustomizationOptionView,
  ProductView,
} from "@dextea/constraints"

export const productApi = {
  listActive(): Promise<ProductView[]> {
    return http.get<ProductView[]>(apiRoutes.product.list())
  },
  toggleStoreStatus(id: number): Promise<{ storeStatus: ProductStoreStatusCode }> {
    return http.patch<{ storeStatus: ProductStoreStatusCode }>(
      apiRoutes.product.storeStatus(id),
    )
  },
  batchSetStoreStatus(
    productIds: number[],
    status: ProductStoreStatusCode,
  ): Promise<null> {
    return http.post<null>(apiRoutes.product.batchStoreStatus(), {
      productIds,
      status,
    })
  },
  listCustomizations(productId: number): Promise<CustomizationItemView[]> {
    return http.get<CustomizationItemView[]>(
      apiRoutes.customization.listByProduct(productId),
    )
  },
  updateOptionStoreStatus(
    optionId: number,
    status: CustomizationOptionStoreStatusCode,
  ): Promise<{ storeStatus: CustomizationOptionStoreStatusCode }> {
    return http.patch<{ storeStatus: CustomizationOptionStoreStatusCode }>(
      apiRoutes.customization.optionStoreStatus(optionId),
      { status },
    )
  },
}
