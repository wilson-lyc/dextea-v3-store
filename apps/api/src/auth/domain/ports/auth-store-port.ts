export interface StoreCredential {
  id: number
  account: string
  password: string
  status: number
}

export interface AuthStorePort {
  findByAccount(account: string): Promise<StoreCredential | null>
}
