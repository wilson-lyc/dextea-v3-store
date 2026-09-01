import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"

import { ThemeProvider } from "@/app/theme-provider"
import { clearSession } from "@/features/auth/session"
import { paths } from "@/router/paths"
import { onSessionExpired } from "@/shared/api/session-events"
import { logger } from "@/shared/lib/logger"
import { Toaster } from "@/shared/ui/toast"

export function AppProviders() {
  const navigate = useNavigate()

  useEffect(
    () =>
      onSessionExpired(() => {
        clearSession()
        logger.info("登录已失效，跳转登录页")
        navigate(paths.login, { replace: true })
      }),
    [navigate],
  )

  return (
    <ThemeProvider>
      <Outlet />
      <Toaster />
    </ThemeProvider>
  )
}
