import path from 'node:path'
import { credentials, type Client, status as grpcStatus } from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { loadPackageDefinition } from '@grpc/grpc-js'
import { getConfig } from '@/config/index.js'
import { BizError } from '@/shared/errors.js'
import { authErrors } from '@/modules/auth/auth.error.js'
import { storeErrors } from '@/modules/store/store.error.js'
import { Store } from '@/modules/store/store.model.js'
import { StoreStatus, type ResetPasswordRequest, type StoreStatusCode } from '@dextea/constraints'
import type { StoreService } from '@/modules/store/store.service.js'

type RpcStore = {
  id: number | string
  name: string
  province: string
  city: string
  district: string
  address: string
  status: number
  businessHours: string
  phone: string
  longitude: number
  latitude: number
  account: string
  email: string
  createdAt: string
  updatedAt: string
}

type StoreRpcClient = Client & {
  getStore: (request: { id: number }, callback: RpcCallback<{ store?: RpcStore } | RpcStore>) => void
  getStoreByAccount: (request: { account: string }, callback: RpcCallback<RpcStore>) => void
  authenticateStore: (
    request: { account: string; password: string },
    callback: RpcCallback<{ storeId: number | string; status: number; name: string }>
  ) => void
  updateStoreStatus: (request: { id: number; status: number }, callback: RpcCallback<RpcStore>) => void
  changeStorePassword: (
    request: { id: number; oldPassword: string; newPassword: string },
    callback: RpcCallback<{ changed: boolean }>
  ) => void
}

type RpcCallback<T> = (error: Error | null, response: T) => void

function protoPath(): string {
  return process.env.STORE_SERVICE_PROTO_PATH?.trim() ||
    path.resolve(process.cwd(), '../../../dextea-proto/proto/store/v1/store.proto')
}

function createClient(): StoreRpcClient {
  const packageDefinition = protoLoader.loadSync(protoPath(), {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  })
  const packages = loadPackageDefinition(packageDefinition) as unknown as {
    dextea: { store: { v1: { StoreService: new (address: string, creds: ReturnType<typeof credentials.createInsecure>) => StoreRpcClient } } }
  }
  const { address } = getConfig().storeService
  return new packages.dextea.store.v1.StoreService(address, credentials.createInsecure())
}

function callRpc<T>(call: (callback: RpcCallback<T>) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    call((error, response) => (error ? reject(error) : resolve(response)))
  })
}

function mapRpcError(error: unknown, operation: 'auth' | 'password' | 'store'): Error {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? (error as { code?: unknown }).code
    : undefined

  if (code === grpcStatus.NOT_FOUND) return new BizError(storeErrors.STORE_NOT_FOUND)
  if (operation === 'auth' && code === grpcStatus.UNAUTHENTICATED) {
    return new BizError(authErrors.INVALID_CREDENTIALS)
  }
  if (operation === 'password' && code === grpcStatus.UNAUTHENTICATED) {
    return new BizError(storeErrors.OLD_PASSWORD_INCORRECT)
  }
  if (operation === 'store' && code === grpcStatus.INVALID_ARGUMENT) {
    return new BizError(storeErrors.INVALID_STORE_STATUS)
  }
  return error instanceof Error ? error : new Error('门店服务调用失败')
}

function toModel(store: RpcStore): Store {
  return new Store(
    Number(store.id), store.account, '', store.name, store.province, store.city,
    store.district, store.address, store.status as StoreStatusCode, store.businessHours,
    store.phone, store.longitude, store.latitude, store.email, store.createdAt, store.updatedAt
  )
}

export class GrpcStoreServiceClient implements StoreService {
  private readonly client = createClient()

  public async getById(id: number): Promise<Store> {
    try {
      const response = await callRpc((callback) => this.client.getStore({ id }, callback))
      const store = 'store' in response ? response.store : response
      if (!store) throw new BizError(storeErrors.STORE_NOT_FOUND)
      return toModel(store)
    } catch (error) {
      throw mapRpcError(error, 'store')
    }
  }

  public async getByAccount(account: string): Promise<Store> {
    try {
      return toModel(await callRpc((callback) => this.client.getStoreByAccount({ account }, callback)))
    } catch (error) {
      throw mapRpcError(error, 'store')
    }
  }

  public async authenticate(account: string, password: string): Promise<Store> {
    try {
      const auth = await callRpc((callback) => this.client.authenticateStore({ account, password }, callback))
      if (auth.status === StoreStatus.keyMap.DEFUNCT) {
        throw new BizError(authErrors.STORE_DISABLED)
      }
      return this.getById(Number(auth.storeId))
    } catch (error) {
      if (BizError.isBizError(error)) throw error
      throw mapRpcError(error, 'auth')
    }
  }

  public async updateStatus(id: number, status: StoreStatusCode): Promise<void> {
    try {
      await callRpc((callback) => this.client.updateStoreStatus({ id, status }, callback))
    } catch (error) {
      throw mapRpcError(error, 'store')
    }
  }

  public async changePassword(id: number, input: ResetPasswordRequest): Promise<void> {
    await this.updatePassword(id, input)
  }

  public async resetPassword(id: number, input: ResetPasswordRequest): Promise<void> {
    await this.updatePassword(id, input)
  }

  private async updatePassword(id: number, input: ResetPasswordRequest): Promise<void> {
    try {
      await callRpc((callback) => this.client.changeStorePassword({
        id, oldPassword: input.oldPassword, newPassword: input.newPassword,
      }, callback))
    } catch (error) {
      throw mapRpcError(error, 'password')
    }
  }

  public close(): void {
    this.client.close()
  }
}
