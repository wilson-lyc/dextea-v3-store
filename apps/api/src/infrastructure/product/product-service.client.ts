import path from 'node:path'
import { credentials, loadPackageDefinition, Metadata, type Client, status as grpcStatus } from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import {
  CustomizationItemStatus,
  CustomizationOptionGlobalStatus,
  CustomizationOptionStoreStatus,
  ProductGlobalStatus,
  ProductStoreStatus,
  type CustomizationItemStatusCode,
  type CustomizationOptionGlobalStatusCode,
  type CustomizationOptionStoreStatusCode,
  type ProductGlobalStatusCode,
  type ProductStoreStatusCode,
} from '@dextea/constraints'
import { getConfig } from '@/config/index.js'
import { BizError } from '@/shared/errors.js'
import { productErrors } from '@/modules/product/product.error.js'
import { customizationErrors } from '@/modules/customization/customization.error.js'
import { Product } from '@/modules/product/product.model.js'
import { CustomizationItem, CustomizationOption } from '@/modules/customization/customization.model.js'
import type { ProductRepository } from '@/modules/product/product.repository.js'
import type { CustomizationRepository } from '@/modules/customization/customization.repository.js'
import { getNacosNamingClient, isNacosDiscoveryEnabled } from '@/infrastructure/nacos/naming-client.js'
import { NacosServiceDiscovery } from '@/infrastructure/nacos/service-discovery.js'

type Callback<T> = (error: Error | null, response: T) => void
type RpcProduct = { id: number | string; name: string; brief?: string; description: string; status: number; price: number; createdAt: string; updatedAt: string }
type RpcItem = { id: number | string; productId: number | string; name: string; sort: number; status: number; createdAt: string; updatedAt: string }
type RpcOption = { id: number | string; itemId: number | string; name: string; price: number; sort: number; status: number; createdAt: string; updatedAt: string }
type StatusView = { productId?: number | string; optionId?: number | string; storeStatus: number }

type ProductAdminRpcClient = Client & {
  listProducts(request: object, metadata: Metadata, cb: Callback<{ products: RpcProduct[]; total: number | string }>): void
  batchSetProductStoreStatus(request: object, metadata: Metadata, cb: Callback<{ updatedCount: number }>): void
  listCustomizationItems(request: object, metadata: Metadata, cb: Callback<{ items: RpcItem[]; total: number | string }>): void
  listCustomizationOptions(request: object, metadata: Metadata, cb: Callback<{ options: RpcOption[]; total: number | string }>): void
  batchSetCustomizationOptionStoreStatus(request: object, metadata: Metadata, cb: Callback<{ updatedCount: number }>): void
}

type ProductBusinessRpcClient = Client & {
  getProductStoreStatuses(request: object, metadata: Metadata, cb: Callback<{ products: StatusView[] }>): void
  getCustomizationOptionStoreStatuses(request: object, metadata: Metadata, cb: Callback<{ options: StatusView[] }>): void
}

type ProductRpcClients = {
  admin: ProductAdminRpcClient
  business: ProductBusinessRpcClient
}

function rpc<T>(token: string, call: (cb: Callback<T>, metadata: Metadata) => void): Promise<T> {
  const metadata = new Metadata()
  if (token) metadata.set('x-service-token', token)
  return new Promise((resolve, reject) => call((error, value) => (error ? reject(error) : resolve(value)), metadata))
}

function protoPath(): string {
  return process.env.PRODUCT_SERVICE_PROTO_PATH?.trim() ||
    path.resolve(process.cwd(), '../../../dextea-proto/proto/product/v1/product.proto')
}

function createClient(address: string): ProductRpcClients {
  const definition = protoLoader.loadSync(protoPath(), { keepCase: false, longs: String, defaults: true, oneofs: true })
  const packages = loadPackageDefinition(definition) as unknown as {
    dextea: { product: { v1: {
      ProductAdminService: new (address: string, creds: ReturnType<typeof credentials.createInsecure>) => ProductAdminRpcClient
      ProductBusinessService: new (address: string, creds: ReturnType<typeof credentials.createInsecure>) => ProductBusinessRpcClient
    } } }
  }
  return {
    admin: new packages.dextea.product.v1.ProductAdminService(address, credentials.createInsecure()),
    business: new packages.dextea.product.v1.ProductBusinessService(address, credentials.createInsecure()),
  }
}

async function resolveAddress(): Promise<string> {
  const config = getConfig()
  if (isNacosDiscoveryEnabled()) {
    try {
      const address = await new NacosServiceDiscovery(await getNacosNamingClient(), { group: config.nacos.group, clusters: config.nacos.clusters, defaultScheme: 'http' }).selectOneHealthyAddress(config.productService.serviceName)
      if (address) return address
    } catch { /* 静态地址兜底 */ }
  }
  return config.productService.address
}

function mapError(error: unknown, domain: 'product' | 'customization'): Error {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? (error as { code?: unknown }).code
    : undefined
  if (code === grpcStatus.NOT_FOUND) {
    return new BizError(domain === 'product' ? productErrors.PRODUCT_NOT_FOUND : customizationErrors.OPTION_NOT_FOUND)
  }
  return error instanceof Error ? error : new Error('商品服务调用失败')
}

function productModel(row: RpcProduct): Product {
  return new Product(Number(row.id), row.name, row.description || null, row.price,
    row.status as ProductGlobalStatusCode, row.createdAt, row.updatedAt)
}

function itemModel(row: RpcItem): CustomizationItem {
  return new CustomizationItem(Number(row.id), Number(row.productId), row.name, row.sort,
    row.status as CustomizationItemStatusCode, row.createdAt, row.updatedAt)
}

function optionModel(row: RpcOption): CustomizationOption {
  return new CustomizationOption(Number(row.id), Number(row.itemId), row.name, row.price, row.sort,
    row.status as CustomizationOptionGlobalStatusCode, row.createdAt, row.updatedAt)
}

export class GrpcProductRepository implements ProductRepository {
  public constructor(private readonly clientFactory: () => Promise<ProductRpcClients>) {}
  private async call<T>(fn: (clients: ProductRpcClients) => Promise<T>): Promise<T> {
    const clients = await this.clientFactory()
    try { return await fn(clients) } finally { clients.admin.close(); clients.business.close() }
  }

  public async findGloballyActive(): Promise<Product[]> {
    try {
      const response = await this.call<{ products: RpcProduct[]; total: number | string }>((clients) => rpc(getConfig().productService.adminToken, (cb, metadata) => clients.admin.listProducts({ page: 1, pageSize: 100, status: ProductGlobalStatus.keyMap.ACTIVE, name: '' }, metadata, cb)))
      return response.products.map(productModel)
    } catch (error) { throw mapError(error, 'product') }
  }

  public async findStoreStatusByStoreId(storeId: number, productIds: readonly number[]): Promise<Map<number, ProductStoreStatusCode>> {
    const result = new Map<number, ProductStoreStatusCode>(productIds.map((id) => [id, ProductStoreStatus.keyMap.DISABLED]))
    if (productIds.length === 0) return result
    try {
      const response = await this.call<{ products: StatusView[] }>((clients) => rpc(getConfig().productService.businessToken, (cb, metadata) => clients.business.getProductStoreStatuses({ storeId, productIds }, metadata, cb)))
      for (const row of response.products) result.set(Number(row.productId), ProductStoreStatus.schema().parse(row.storeStatus) as ProductStoreStatusCode)
      return result
    } catch (error) { throw mapError(error, 'product') }
  }

  public async setStoreStatus(storeId: number, productId: number, status: ProductStoreStatusCode): Promise<void> {
    return this.batchSetStoreStatus(storeId, [productId], status)
  }

  public async batchSetStoreStatus(storeId: number, productIds: readonly number[], status: ProductStoreStatusCode): Promise<void> {
    if (productIds.length === 0) return
    try { await this.call((clients) => rpc(getConfig().productService.adminToken, (cb, metadata) => clients.admin.batchSetProductStoreStatus({ storeId, productIds, status }, metadata, cb))) }
    catch (error) { throw mapError(error, 'product') }
  }
}

export class GrpcCustomizationRepository implements CustomizationRepository {
  public constructor(private readonly clientFactory: () => Promise<ProductRpcClients>) {}
  private async call<T>(fn: (clients: ProductRpcClients) => Promise<T>): Promise<T> {
    const clients = await this.clientFactory()
    try { return await fn(clients) } finally { clients.admin.close(); clients.business.close() }
  }

  public async findActiveItemsByProductId(productId: number): Promise<CustomizationItem[]> {
    try {
      const response = await this.call<{ items: RpcItem[]; total: number | string }>((clients) => rpc(getConfig().productService.adminToken, (cb, metadata) => clients.admin.listCustomizationItems({ productId, page: 1, pageSize: 100, status: CustomizationItemStatus.keyMap.ACTIVE, name: '' }, metadata, cb)))
      return response.items.map(itemModel)
    } catch (error) { throw mapError(error, 'customization') }
  }

  public async findActiveOptionsByItemIds(itemIds: readonly number[]): Promise<CustomizationOption[]> {
    try {
      const lists = await Promise.all(itemIds.map((itemId) => this.call<{ options: RpcOption[]; total: number | string }>((clients) => rpc(getConfig().productService.adminToken, (cb, metadata) => clients.admin.listCustomizationOptions({ itemId, page: 1, pageSize: 100, status: CustomizationOptionGlobalStatus.keyMap.ACTIVE, name: '' }, metadata, cb)))))
      return lists.flatMap((response) => response.options.map(optionModel))
    } catch (error) { throw mapError(error, 'customization') }
  }

  public async findOptionStoreStatusByStoreId(storeId: number, optionIds: readonly number[]): Promise<Map<number, CustomizationOptionStoreStatusCode>> {
    const result = new Map<number, CustomizationOptionStoreStatusCode>(optionIds.map((id) => [id, CustomizationOptionStoreStatus.keyMap.DISABLED]))
    if (optionIds.length === 0) return result
    try {
      const response = await this.call<{ options: StatusView[] }>((clients) => rpc(getConfig().productService.businessToken, (cb, metadata) => clients.business.getCustomizationOptionStoreStatuses({ storeId, optionIds }, metadata, cb)))
      for (const row of response.options) result.set(Number(row.optionId), CustomizationOptionStoreStatus.schema().parse(row.storeStatus) as CustomizationOptionStoreStatusCode)
      return result
    } catch (error) { throw mapError(error, 'customization') }
  }

  public async upsertOptionStoreStatus(optionId: number, storeId: number, status: CustomizationOptionStoreStatusCode): Promise<void> {
      try { await this.call((clients) => rpc(getConfig().productService.adminToken, (cb, metadata) => clients.admin.batchSetCustomizationOptionStoreStatus({ storeId, optionIds: [optionId], status }, metadata, cb))) }
    catch (error) { throw mapError(error, 'customization') }
  }
}

export function createProductRpcRepositories(): { product: GrpcProductRepository; customization: GrpcCustomizationRepository; close: () => void } {
  const factory = async () => createClient(await resolveAddress())
  return {
    product: new GrpcProductRepository(factory),
    customization: new GrpcCustomizationRepository(factory),
    close: () => undefined,
  }
}
