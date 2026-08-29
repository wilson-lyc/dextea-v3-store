import { useNavigate } from "react-router-dom"

import type { LoginRequest } from "@dextea/constraints"

import { paths } from "@/router/paths"
import { useLogin } from "@/features/auth/use-login"
import { LoginForm } from "@/features/auth/components/login-form"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, pending, error } = useLogin()

  async function handleSubmit(credentials: LoginRequest): Promise<void> {
    const result = await login(credentials)
    if (result) navigate(paths.home, { replace: true })
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <LoginForm pending={pending} error={error} onSubmit={handleSubmit} />
    </div>
  )
}
