import { useEffect, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { storeApi, type StoreView } from "@/lib/api/store"
import { ApiError } from "@/lib/api/request"
import { logger } from "@/lib/logger"
import { toast } from "@/lib/toast"
import { StoreStatus, type StoreStatusCode } from "@dextea/constraints"

interface StatusOption {
  code: StoreStatusCode
  label: string
  description: string
  variant: "default" | "outline" | "secondary" | "destructive"
}

const statusOptions: StatusOption[] = [
  {
    code: StoreStatus[1].code,
    label: StoreStatus[1].label,
    description: "门店正常营业，可接单",
    variant: "default",
  },
  {
    code: StoreStatus[0].code,
    label: StoreStatus[0].label,
    description: "暂时关闭，不接新单",
    variant: "outline",
  },
  {
    code: StoreStatus[2].code,
    label: StoreStatus[2].label,
    description: "门店尚未开业",
    variant: "secondary",
  },
  {
    code: StoreStatus[3].code,
    label: StoreStatus[3].label,
    description: "门店已永久关闭",
    variant: "destructive",
  },
]

export default function StoreSettingsPage() {
  const [store, setStore] = useState<StoreView | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resettingPassword, setResettingPassword] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    storeApi
      .getStore()
      .then((data) => {
        if (cancelled) return
        setStore(data)
      })
      .catch((err) => {
        if (cancelled) return
        logger.error("获取门店信息失败", err)
        toast.error(err instanceof ApiError ? err.message : "获取门店信息失败")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleUpdateStatus(status: StoreStatusCode) {
    if (!store || store.status === status) return
    setUpdatingStatus(true)
    try {
      await storeApi.updateStatus({ status })
      setStore({ ...store, status })
      toast.success("门店状态已更新")
    } catch (err) {
      logger.error("更新门店状态失败", err)
      toast.error(err instanceof ApiError ? err.message : "更新门店状态失败")
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!store) return

    if (newPassword !== confirmPassword) {
      toast.error("两次输入的新密码不一致")
      return
    }

    setResettingPassword(true)
    try {
      await storeApi.resetPassword({
        oldPassword,
        newPassword,
      })
      toast.success("密码已重置")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      logger.error("重置密码失败", err)
      toast.error(err instanceof ApiError ? err.message : "重置密码失败")
    } finally {
      setResettingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">无法获取门店信息</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>门店信息</CardTitle>
          <CardDescription>查看门店基本信息</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">门店名称</dt>
              <dd className="font-medium">{store.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">联系电话</dt>
              <dd className="font-medium">{store.phone}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">营业时间</dt>
              <dd className="font-medium">{store.businessHours}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">邮箱</dt>
              <dd className="font-medium">{store.email}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">门店地址</dt>
              <dd className="font-medium">
                {store.province}
                {store.city}
                {store.district}
                {store.address}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>门店状态</CardTitle>
          <CardDescription>切换门店营业状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {statusOptions.map((option) => {
              const isActive = store.status === option.code
              return (
                <button
                  key={option.code}
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(option.code)}
                  className={[
                    "flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition",
                    "hover:border-ring hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    isActive
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{option.label}</span>
                    {isActive && (
                      <span className="rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                        当前
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>重置密码</CardTitle>
          <CardDescription>修改门店登录密码</CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="flex flex-col gap-4 pb-(--card-spacing)">
            <div className="flex flex-col gap-2">
              <Label htmlFor="oldPassword">原密码</Label>
              <Input
                id="oldPassword"
                type="password"
                placeholder="请输入原密码"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="至少 6 位"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                maxLength={64}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={resettingPassword}>
              {resettingPassword ? "提交中..." : "确认重置"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
