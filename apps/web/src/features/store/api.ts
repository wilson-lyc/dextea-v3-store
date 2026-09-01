import {
  apiRoutes,
  type ResetPasswordRequest,
  type StoreView,
  type UpdateStoreStatusRequest,
} from "@dextea/constraints"

import { http } from "@/shared/api/client"

export type { StoreView } from "@dextea/constraints"

export const storeApi = {
  getStore(): Promise<StoreView> {
    return http.get<StoreView>(apiRoutes.store.current())
  },
  updateStatus(body: UpdateStoreStatusRequest): Promise<void> {
    return http.put<void>(apiRoutes.store.status(), body)
  },
  resetPassword(body: ResetPasswordRequest): Promise<void> {
    return http.put<void>(apiRoutes.store.password(), body)
  },
}
