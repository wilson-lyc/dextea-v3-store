import type { LoginRequest, LoginResponse } from "@dextea/constraints"

import { http } from "./request"

export const authApi = {
  login(body: LoginRequest): Promise<LoginResponse> {
    return http.post<LoginResponse>("/api/v1/auth/login", body)
  },
}
