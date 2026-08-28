import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/request"
import { logger } from "@/lib/logger"
import { setSession } from "@/lib/session"

export default function LoginPage() {
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await authApi.login({ account, password })
      setSession(result.token, result.store)
      logger.info("登录成功", `${result.store.name}(storeId=${result.storeId})`)
      navigate("/", { replace: true })
    } catch (err) {
      logger.warn("登录失败", err)
      setError(err instanceof ApiError ? err.message : "登录失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>登录</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4 pb-(--card-spacing)">
            <div className="flex flex-col gap-2">
              <Label htmlFor="account">账号</Label>
              <Input
                id="account"
                type="text"
                placeholder="请输入账号"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
