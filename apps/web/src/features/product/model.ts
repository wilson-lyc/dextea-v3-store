import {
  ProductStoreStatus,
  customizationOptionStoreStatusCode,
  type ProductStoreStatusCode,
  type ProductView,
} from "@dextea/constraints"

export type { ProductView }

export type ProductFilter = "ALL" | "ACTIVE" | "DISABLED"

export const PRODUCT_STORE_ACTIVE = ProductStoreStatus.keyMap.ACTIVE
export const PRODUCT_STORE_DISABLED = ProductStoreStatus.keyMap.DISABLED

export const OPTION_STORE_ACTIVE = customizationOptionStoreStatusCode.STORE_ACTIVE
export const OPTION_STORE_DISABLED = customizationOptionStoreStatusCode.STORE_DISABLED

export interface ProductCounts {
  all: number
  active: number
  disabled: number
}

export const PRODUCT_FILTERS = [
  { key: "ALL", label: "全部" },
  { key: "ACTIVE", label: "可售" },
  { key: "DISABLED", label: "售罄" },
] as const satisfies ReadonlyArray<{ key: ProductFilter; label: string }>

export function countProducts(products: ProductView[]): ProductCounts {
  return {
    all: products.length,
    active: products.filter((item) => item.storeStatus === PRODUCT_STORE_ACTIVE).length,
    disabled: products.filter((item) => item.storeStatus === PRODUCT_STORE_DISABLED).length,
  }
}

export function filterProducts(
  products: ProductView[],
  filter: ProductFilter,
): ProductView[] {
  if (filter === "ACTIVE") {
    return products.filter((item) => item.storeStatus === PRODUCT_STORE_ACTIVE)
  }
  if (filter === "DISABLED") {
    return products.filter((item) => item.storeStatus === PRODUCT_STORE_DISABLED)
  }
  return products
}

export function nextProductStoreStatus(product: ProductView): ProductStoreStatusCode {
  return product.storeStatus === PRODUCT_STORE_ACTIVE
    ? PRODUCT_STORE_DISABLED
    : PRODUCT_STORE_ACTIVE
}
