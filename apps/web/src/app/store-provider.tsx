/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from "react"

import { useStoreSource, type StoreState } from "@/features/store/hooks/use-store"

const StoreContext = createContext<StoreState | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const state = useStoreSource()

  return <StoreContext.Provider value={state}>{children}</StoreContext.Provider>
}

export function useStore(): StoreState {
  const state = useContext(StoreContext)
  if (state === null) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return state
}
