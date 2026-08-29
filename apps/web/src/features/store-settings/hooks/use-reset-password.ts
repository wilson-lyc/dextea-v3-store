import type { ResetPasswordRequest } from "@dextea/constraints"

import { useMutation } from "@/shared/hooks/use-mutation"
import { storeApi } from "@/features/store/api"

export function useResetPassword() {
  return useMutation(
    async (body: ResetPasswordRequest) => {
      await storeApi.resetPassword(body)
      return true
    },
    { successMessage: "密码已重置", errorMessage: "重置密码失败" },
  )
}
