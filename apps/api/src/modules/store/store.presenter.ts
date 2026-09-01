import type { StoreView } from '@dextea/constraints'
import type { Store } from './store.model.js'

export function toStoreView(store: Store): StoreView {
  return {
    id: store.id,
    name: store.name,
    province: store.province,
    city: store.city,
    district: store.district,
    address: store.address,
    status: store.status,
    businessHours: store.businessHours,
    phone: store.phone,
    longitude: store.longitude,
    latitude: store.latitude,
    email: store.email,
    available: store.isAvailable(),
  }
}
