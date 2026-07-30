import * as React from "react"
import { toast as toastManager } from "@/components/ui/toast"

export type ToastType = "success" | "info" | "warning" | "error" | "loading"

export interface ToastOptions {
  title: React.ReactNode
  description?: React.ReactNode
  timeout?: number
  actionProps?: React.ComponentPropsWithoutRef<"button">
  priority?: "low" | "high"
  onClose?: () => void
  onRemove?: () => void
}

type RestOptions = Omit<ToastOptions, "title" | "type">

export interface PromiseToastOptions<Value> {
  loading: React.ReactNode
  success: React.ReactNode | ((result: Value) => React.ReactNode)
  error: React.ReactNode | ((error: unknown) => React.ReactNode)
  description?: React.ReactNode
}

function addToast(options: ToastOptions & { type?: ToastType }): string {
  return toastManager.add({
    title: options.title,
    description: options.description,
    type: options.type,
    timeout: options.timeout,
    actionProps: options.actionProps,
    priority: options.priority,
    onClose: options.onClose,
    onRemove: options.onRemove,
  })
}

function typeToast(type: ToastType) {
  return (title: React.ReactNode, rest: RestOptions = {}): string =>
    addToast({ ...rest, title, type })
}

function resolve(
  value: React.ReactNode | ((result: any) => React.ReactNode),
  type: ToastType,
  description?: React.ReactNode
): any {
  if (typeof value === "function") {
    return (result: any) => ({ title: value(result), type, description })
  }
  return { title: value, type, description }
}

interface ToastApi {
  (options: ToastOptions): string
  success: (title: React.ReactNode, rest?: RestOptions) => string
  error: (title: React.ReactNode, rest?: RestOptions) => string
  info: (title: React.ReactNode, rest?: RestOptions) => string
  warning: (title: React.ReactNode, rest?: RestOptions) => string
  loading: (title: React.ReactNode, rest?: RestOptions) => string
  close: (id?: string) => void
  update: (id: string, options: ToastOptions) => void
  promise: <Value>(
    promise: Promise<Value>,
    options: PromiseToastOptions<Value>
  ) => Promise<Value>
}

const toast = Object.assign(
  (options: ToastOptions) => addToast(options),
  {
    success: typeToast("success"),
    error: typeToast("error"),
    info: typeToast("info"),
    warning: typeToast("warning"),
    loading: typeToast("loading"),
    close: (id?: string) => toastManager.close(id),
    update: (id: string, options: ToastOptions) =>
      toastManager.update(id, options),
    promise: <Value>(
      promise: Promise<Value>,
      options: PromiseToastOptions<Value>
    ): Promise<Value> =>
      toastManager.promise(promise, {
        loading: {
          title: options.loading,
          type: "loading",
          description: options.description,
        },
        success: resolve(options.success, "success", options.description),
        error: resolve(options.error, "error", options.description),
      }),
  }
) as ToastApi

export { toast }
