import path from 'node:path'
import { credentials, Metadata, type Client, status as grpcStatus } from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { loadPackageDefinition } from '@grpc/grpc-js'
import { getConfig } from '@/config/index.js'
import { BizError } from '@/shared/errors.js'
import { authErrors } from '@/modules/auth/auth.error.js'
import { storeErrors } from '@/modules/store/store.error.js'
import { Store } from '@/modules/store/store.model.js'
import { StoreStatus, type ResetPasswordRequest, type StoreStatusCode } from '@dextea/constraints'
import type { StoreService } from '@/modules/store/store.service.js'
import { getNacosNamingClient, isNacosDiscoveryEnabled } from '@/infrastructure/nacos/naming-client.js'
import { NacosServiceDiscovery } from '@/infrastructure/nacos/service-discovery.js'

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

type StoreAdminRpcClient = Client & {
  getStore: (request: { id: number }, metadata: Metadata, callback: RpcCallback<{ store?: RpcStore } | RpcStore>) => void
  getStoreByAccount: (request: { account: string }, metadata: Metadata, callback: RpcCallback<RpcStore>) => void
  updateStoreStatus: (request: { id: number; status: number }, metadata: Metadata, callback: RpcCallback<RpcStore>) => void
}

type StoreCredentialRpcClient = Client & {
  authenticateStore: (
    request: { account: string; password: string }, metadata: Metadata,
    callback: RpcCallback<{ storeId: number | string; status: number; name: string }>
  ) => void
  changeStorePassword: (
    request: { id: number; oldPassword: string; newPassword: string }, metadata: Metadata,
    callback: RpcCallback<{ changed: boolean }>
  ) => void
}

type RpcCallback<T> = (error: Error | null, response: T) => void

function protoPath(): string {
  return process.env.STORE_SERVICE_PROTO_PATH?.trim() ||
    path.resolve(process.cwd(), '../../../dextea-proto/proto/store/v1/store.proto')
}

function createClient<T extends Client>(serviceName: 'StoreAdminService' | 'StoreCredentialService', address: string): T {
  const packageDefinition = protoLoader.loadSync(protoPath(), {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  })
  const packages = loadPackageDefinition(packageDefinition) as unknown as {
    dextea: { store: { v1: Record<string, new (address: string, creds: ReturnType<typeof credentials.createInsecure>) => Client> } }
  }
  const Service = packages.dextea.store.v1[serviceName]
  if (!Service) throw new Error(`门店服务定义不存在: ${serviceName}`)
  return new Service(address, credentials.createInsecure()) as T
}

async function resolveAddress(): Promise<string> {
  const config = getConfig()
  if (isNacosDiscoveryEnabled()) {
    try {
      const address = await new NacosServiceDiscovery(await getNacosNamingClient(), { group: config.nacos.group, clusters: config.nacos.clusters, defaultScheme: 'http' }).selectOneHealthyAddress(config.storeService.serviceName)
      if (address) return address
    } catch { /* 静态地址兜底 */ }
  }
  return config.storeService.address
}

function callRpc<T>(token: string, call: (metadata: Metadata, callback: RpcCallback<T>) => void): Promise<T> {
  const metadata = new Metadata()
  if (token) metadata.set('x-service-token', token)
  return new Promise((resolve, reject) => {
    call(metadata, (error, response) => (error ? reject(error) : resolve(response)))
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
  private async callAdmin<T>(fn: (client: StoreAdminRpcClient) => Promise<T>): Promise<T> {
    const client = createClient<StoreAdminRpcClient>('StoreAdminService', await resolveAddress())
    try { return await fn(client) } finally { client.close() }
  }

  private async callCredential<T>(fn: (client: StoreCredentialRpcClient) => Promise<T>): Promise<T> {
    const client = createClient<StoreCredentialRpcClient>('StoreCredentialService', await resolveAddress())
    try { return await fn(client) } finally { client.close() }
  }

  public async getById(id: number): Promise<Store> {
    try {
      const response = await this.callAdmin<{ store?: RpcStore } | RpcStore>((client) => callRpc(getConfig().storeService.adminToken, (metadata, callback) => client.getStore({ id }, metadata, callback)))
      const store = ('store' in response ? response.store : response) as RpcStore | undefined
      if (!store) throw new BizError(storeErrors.STORE_NOT_FOUND)
      return toModel(store)
    } catch (error) {
      throw mapRpcError(error, 'store')
    }
  }

  public async getByAccount(account: string): Promise<Store> {
    try {
      return toModel(await this.callAdmin<RpcStore>((client) => callRpc(getConfig().storeService.adminToken, (metadata, callback) => client.getStoreByAccount({ account }, metadata, callback))))
    } catch (error) {
      throw mapRpcError(error, 'store')
    }
  }

  public async authenticate(account: string, password: string): Promise<Store> {
    try {
      const auth = await this.callCredential<{ storeId: number | string; status: number; name: string }>((client) => callRpc(getConfig().storeService.credentialToken, (metadata, callback) => client.authenticateStore({ account, password }, metadata, callback)))
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
      await this.callAdmin((client) => callRpc(getConfig().storeService.adminToken, (metadata, callback) => client.updateStoreStatus({ id, status }, metadata, callback)))
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
      await this.callCredential((client) => callRpc(getConfig().storeService.credentialToken, (metadata, callback) => client.changeStorePassword({
        id, oldPassword: input.oldPassword, newPassword: input.newPassword,
      }, metadata, callback)))
    } catch (error) {
      throw mapRpcError(error, 'password')
    }
  }

  public close(): void {}
}
