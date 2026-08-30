import type { ReactNode } from "react"

import { useStoreSource } from "@/features/store/hooks/use-store"

import { StoreContext } from "@/app/store-context"

export function StoreProvider({ children }: { children: ReactNode }) {
  const state = useStoreSource()

  return <StoreContext.Provider value={state}>{children}</StoreContext.Provider>
}
