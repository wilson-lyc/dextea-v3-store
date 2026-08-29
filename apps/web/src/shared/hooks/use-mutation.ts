import { useState } from "react"

import { logger } from "@/shared/lib/logger"
import { resolveErrorMessage } from "@/shared/api/errors"
import { toast } from "@/shared/ui/toast"

type MessageResolver<R> = string | ((result: R) => string)

interface UseMutationOptions<R> {
  successMessage?: MessageResolver<R>
  errorMessage?: string
  silent?: boolean
  onSuccess?: (result: R) => void
  onError?: (err: unknown) => void
}

interface Mutation<A extends unknown[], R> {
  run: (...args: A) => Promise<R | undefined>
  pending: boolean
}

export function useMutation<A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
  options: UseMutationOptions<R> = {},
): Mutation<A, R> {
  const [pending, setPending] = useState(false)

  async function run(...args: A): Promise<R | undefined> {
    const {
      successMessage,
      errorMessage = "操作失败，请稍后重试",
      silent = false,
      onSuccess,
      onError,
    } = options

    setPending(true)
    try {
      const result = await action(...args)

      if (successMessage) {
        toast.add({
          title:
            typeof successMessage === "function" ? successMessage(result) : successMessage,
          type: "success",
        })
      }

      onSuccess?.(result)
      return result
    } catch (err) {
      logger.error(errorMessage, err)

      if (!silent) {
        toast.add({ title: resolveErrorMessage(err, errorMessage), type: "error" })
      }

      onError?.(err)
      return undefined
    } finally {
      setPending(false)
    }
  }

  return { run, pending }
}
