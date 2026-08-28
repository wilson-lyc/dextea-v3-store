import { apiRoutes, type LoginRequest, type LoginResponse } from "@dextea/constraints"

import { http } from "./request"

export const authApi = {
  login(body: LoginRequest): Promise<LoginResponse> {
    return http.post<LoginResponse>(apiRoutes.auth.login(), body)
  },
}
