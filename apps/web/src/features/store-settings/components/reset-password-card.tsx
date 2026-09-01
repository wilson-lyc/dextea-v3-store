import { useState, type FormEvent } from "react"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { toast } from "@/shared/ui/toast"
import { useResetPassword } from "@/features/store-settings/hooks/use-reset-password"

export function ResetPasswordCard() {
  const { run, pending } = useResetPassword()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.add({ title: "两次输入的新密码不一致", type: "error" })
      return
    }

    const done = await run({ oldPassword, newPassword })
    if (!done) return

    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>重置密码</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
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
          <Button type="submit" disabled={pending}>
            {pending ? "处理中..." : "确认重置"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
