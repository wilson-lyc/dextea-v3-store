import { useCallback, useEffect, useRef, useState } from "react"

import { logger } from "@/shared/lib/logger"

export type DataUpdater<T> = (prev: T | undefined) => T

interface UseAsyncDataOptions {
  immediate?: boolean
  deps?: readonly unknown[]
  onError?: (err: unknown) => void
}

interface AsyncData<T> {
  data: T | undefined
  loading: boolean
  error: unknown
  reload: () => void
  setData: (updater: T | DataUpdater<T>) => void
}

interface SettledResult<T> {
  key: string
  data: T | undefined
  error: unknown
}

function resolveUpdater<T>(updater: T | DataUpdater<T>, prev: T | undefined): T {
  return typeof updater === "function" ? (updater as DataUpdater<T>)(prev) : updater
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions = {},
): AsyncData<T> {
  const { immediate = true, deps, onError } = options

  const [reloadToken, setReloadToken] = useState(0)
  const [settled, setSettled] = useState<SettledResult<T> | undefined>(undefined)

  const key = `${JSON.stringify(deps ?? [])}#${reloadToken}`
  const loading = immediate && settled?.key !== key

  const latestRef = useRef({ fetcher, onError })
  useEffect(() => {
    latestRef.current = { fetcher, onError }
  })

  useEffect(() => {
    if (!immediate) return undefined

    let cancelled = false

    latestRef.current
      .fetcher()
      .then((data) => {
        if (cancelled) return
        setSettled({ key, data, error: undefined })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        logger.error("数据加载失败", err)
        latestRef.current.onError?.(err)
        setSettled({ key, data: undefined, error: err })
      })

    return () => {
      cancelled = true
    }
  }, [immediate, key])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const setData = useCallback((updater: T | DataUpdater<T>) => {
    setSettled((prev) =>
      prev ? { ...prev, data: resolveUpdater(updater, prev.data) } : prev,
    )
  }, [])

  return {
    data: settled?.data,
    loading,
    error: settled?.error,
    reload,
    setData,
  }
}
