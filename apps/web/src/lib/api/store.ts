import type { ResetPasswordRequest, UpdateStoreStatusRequest } from "@dextea/constraints"

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
  updateStatus(body: UpdateStoreStatusRequest): Promise<void> {
    return http.put<void>("/api/v1/store/status", body)
  },
  resetPassword(body: ResetPasswordRequest): Promise<void> {
    return http.put<void>("/api/v1/store/password", body)
  },
}
