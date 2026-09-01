import type { StoreView } from "@dextea/constraints"

import { setAuthTokenProvider } from "@/shared/api/client"

const TOKEN_KEY = "token"
const STORE_KEY = "store"

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getStore(): StoreView | null {
  const raw = sessionStorage.getItem(STORE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as StoreView
  } catch {
    sessionStorage.removeItem(STORE_KEY)
    return null
  }
}

export function saveStore(store: StoreView): void {
  sessionStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export function setSession(token: string, store: StoreView): void {
  sessionStorage.setItem(TOKEN_KEY, token)
  saveStore(store)
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(STORE_KEY)
}

setAuthTokenProvider(getToken)
