import type { Store } from '@/store/domain/aggregates/store.js'

export interface StoreView {
  id: number
  name: string
  province: string
  city: string
  district: string
  address: string
  status: number
  businessHours: string
  phone: string
  longitude: number
  latitude: number
  email: string
  available: boolean
}

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
