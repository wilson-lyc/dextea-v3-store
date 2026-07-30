import { http } from "./request"

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

export const storeApi = {
  getStore(): Promise<StoreView> {
    return http.get<StoreView>("/api/v1/store/")
  },
}
