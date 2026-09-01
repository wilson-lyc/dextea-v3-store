import { useState } from "react"

import type { LoginRequest, LoginResponse } from "@dextea/constraints"

import { useMutation } from "@/shared/hooks/use-mutation"
import { resolveErrorMessage } from "@/shared/api/errors"
import { logger } from "@/shared/lib/logger"
import { authApi } from "@/features/auth/api"
import { setSession } from "@/features/auth/session"

export interface LoginState {
  login: (credentials: LoginRequest) => Promise<LoginResponse | undefined>
  pending: boolean
  error: string | null
}

export function useLogin(): LoginState {
  const [error, setError] = useState<string | null>(null)

  const { run, pending } = useMutation(authApi.login, {
    silent: true,
    onSuccess: (result) => {
      setSession(result.token, result.store)
      logger.info("登录成功", `${result.store.name}(storeId=${result.storeId})`)
    },
    onError: (err) => setError(resolveErrorMessage(err, "登录失败，请稍后重试")),
  })

  async function login(
    credentials: LoginRequest,
  ): Promise<LoginResponse | undefined> {
    setError(null)
    return run(credentials)
  }

  return { login, pending, error }
}
