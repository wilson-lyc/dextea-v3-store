import type { StoreView } from "@dextea/constraints"

export type { StoreView }

export function formatStoreAddress(store: StoreView): string {
  return [store.province, store.city, store.district, store.address]
    .filter(Boolean)
    .join("")
}
