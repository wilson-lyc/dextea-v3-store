import { useEffect, useState, type FormEvent } from "react"
import { TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { storeApi, type StoreView } from "@/lib/api/store"
import { ApiError } from "@/lib/api/request"
import { logger } from "@/lib/logger"
import { toast } from "@/lib/toast"
import { StoreStatus, type StoreStatusCode } from "@dextea/constraints"

const CLOSED_CODE = StoreStatus.keyMap.CLOSED
const OPEN_CODE = StoreStatus.keyMap.OPEN

const statusLabelMap: Record<number, string> = {
  [StoreStatus.items[0].value]: StoreStatus.items[0].label,
  [StoreStatus.items[1].value]: StoreStatus.items[1].label,
  [StoreStatus.items[2].value]: StoreStatus.items[2].label,
  [StoreStatus.items[3].value]: StoreStatus.items[3].label,
}

const statusDescMap: Record<number, string> = {
  [StoreStatus.items[0].value]: "暂时关闭，不接新单",
  [StoreStatus.items[1].value]: "门店正常营业，可接单",
  [StoreStatus.items[2].value]: "门店尚未开业",
  [StoreStatus.items[3].value]: "门店已永久关闭",
}

export default function StoreSettingsPage() {
  const [store, setStore] = useState<StoreView | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [pendingStatus, setPendingStatus] = useState<StoreStatusCode | null>(null)

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

  const canToggle = store !== null && (store.status === CLOSED_CODE || store.status === OPEN_CODE)

  function requestUpdateStatus(status: StoreStatusCode) {
    if (!store || store.status === status || !canToggle) return
    setPendingStatus(status)
  }

  async function confirmUpdateStatus() {
    if (!store || pendingStatus === null) return
    setUpdatingStatus(true)
    try {
      await storeApi.updateStatus({ status: pendingStatus })
      setStore({ ...store, status: pendingStatus })
      toast.success("门店状态已更新")
    } catch (err) {
      logger.error("更新门店状态失败", err)
      toast.error(err instanceof ApiError ? err.message : "更新门店状态失败")
    } finally {
      setUpdatingStatus(false)
      setPendingStatus(null)
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
      <div className="flex h-full items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">无法获取门店信息</p>
      </div>
    )
  }

  const currentLabel = statusLabelMap[store.status] ?? "未知"
  const currentDesc = statusDescMap[store.status] ?? ""

  return (
    <>
      <ScrollArea className="h-full">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>门店信息</CardTitle>
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
          <CardDescription>
            {canToggle ? "切换门店营业状态" : "当前状态不可切换"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canToggle ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {([CLOSED_CODE, OPEN_CODE] as StoreStatusCode[]).map((code) => {
                const isActive = store.status === code
                const label = statusLabelMap[code]!
                const desc = statusDescMap[code]!
                return (
                  <button
                    key={code}
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => requestUpdateStatus(code)}
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
                      <span className="text-sm font-semibold">{label}</span>
                      {isActive && (
                        <span className="rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                          当前
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{desc}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <TriangleAlertIcon className="size-5 shrink-0 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{currentLabel}</span>
                <span className="text-xs text-muted-foreground">{currentDesc}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>重置密码</CardTitle>
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
              {resettingPassword ? "处理中..." : "确认重置"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      </div>
      </ScrollArea>

      <AlertDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认切换门店状态</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus !== null && (
                <>
                  确定要将门店状态切换为
                  <span className="font-medium text-foreground">
                    {" "}
                    {statusLabelMap[pendingStatus]}{" "}
                  </span>
                  吗？
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="default"
              disabled={updatingStatus}
              onClick={confirmUpdateStatus}
            >
              {updatingStatus ? "处理中..." : "确认切换"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
