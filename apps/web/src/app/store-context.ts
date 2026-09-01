import { createContext, useContext } from "react"

import type { StoreState } from "@/features/store/hooks/use-store"

export const StoreContext = createContext<StoreState | null>(null)

export function useStore(): StoreState {
  const state = useContext(StoreContext)
  if (state === null) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return state
}
