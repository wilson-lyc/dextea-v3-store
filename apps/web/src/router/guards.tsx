import { Navigate, Outlet } from "react-router-dom"

import { StoreProvider } from "@/app/store-provider"
import { getToken } from "@/features/auth/session"
import { paths } from "@/router/paths"

export function RequireAuth() {
  if (!getToken()) {
    return <Navigate to={paths.login} replace />
  }

  return (
    <StoreProvider>
      <Outlet />
    </StoreProvider>
  )
}
