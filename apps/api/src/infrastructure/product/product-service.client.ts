import path from 'node:path'
import { credentials, loadPackageDefinition, type Client, status as grpcStatus } from '@grpc/grpc-js'
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

type Callback<T> = (error: Error | null, response: T) => void
type RpcProduct = { id: number | string; name: string; brief?: string; description: string; status: number; price: number; createdAt: string; updatedAt: string }
type RpcItem = { id: number | string; productId: number | string; name: string; sort: number; status: number; createdAt: string; updatedAt: string }
type RpcOption = { id: number | string; itemId: number | string; name: string; price: number; sort: number; status: number; createdAt: string; updatedAt: string }
type StatusView = { productId?: number | string; optionId?: number | string; storeStatus: number }

type ProductRpcClient = Client & {
  listProducts(request: object, cb: Callback<{ products: RpcProduct[]; total: number | string }>): void
  getProductStoreStatuses(request: object, cb: Callback<{ products: StatusView[] }>): void
  batchSetProductStoreStatus(request: object, cb: Callback<{ updatedCount: number }>): void
  listCustomizationItems(request: object, cb: Callback<{ items: RpcItem[]; total: number | string }>): void
  listCustomizationOptions(request: object, cb: Callback<{ options: RpcOption[]; total: number | string }>): void
  getCustomizationOptionStoreStatuses(request: object, cb: Callback<{ options: StatusView[] }>): void
  batchSetCustomizationOptionStoreStatus(request: object, cb: Callback<{ updatedCount: number }>): void
}

function rpc<T>(call: (cb: Callback<T>) => void): Promise<T> {
  return new Promise((resolve, reject) => call((error, value) => (error ? reject(error) : resolve(value))))
}

function protoPath(): string {
  return process.env.PRODUCT_SERVICE_PROTO_PATH?.trim() ||
    path.resolve(process.cwd(), '../../../dextea-proto/proto/product/v1/product.proto')
}

function createClient(): ProductRpcClient {
  const definition = protoLoader.loadSync(protoPath(), { keepCase: false, longs: String, defaults: true, oneofs: true })
  const packages = loadPackageDefinition(definition) as unknown as {
    dextea: { product: { v1: { ProductService: new (address: string, creds: ReturnType<typeof credentials.createInsecure>) => ProductRpcClient } } }
  }
  return new packages.dextea.product.v1.ProductService(
    getConfig().productService.address,
    credentials.createInsecure()
  )
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
  public constructor(private readonly client: ProductRpcClient) {}

  public async findGloballyActive(): Promise<Product[]> {
    try {
      const response = await rpc((cb) => this.client.listProducts({ page: 1, pageSize: 100, status: ProductGlobalStatus.keyMap.ACTIVE, name: '' }, cb))
      return response.products.map(productModel)
    } catch (error) { throw mapError(error, 'product') }
  }

  public async findStoreStatusByStoreId(storeId: number, productIds: readonly number[]): Promise<Map<number, ProductStoreStatusCode>> {
    const result = new Map<number, ProductStoreStatusCode>(productIds.map((id) => [id, ProductStoreStatus.keyMap.DISABLED]))
    if (productIds.length === 0) return result
    try {
      const response = await rpc((cb) => this.client.getProductStoreStatuses({ storeId, productIds }, cb))
      for (const row of response.products) result.set(Number(row.productId), ProductStoreStatus.schema().parse(row.storeStatus) as ProductStoreStatusCode)
      return result
    } catch (error) { throw mapError(error, 'product') }
  }

  public async setStoreStatus(storeId: number, productId: number, status: ProductStoreStatusCode): Promise<void> {
    return this.batchSetStoreStatus(storeId, [productId], status)
  }

  public async batchSetStoreStatus(storeId: number, productIds: readonly number[], status: ProductStoreStatusCode): Promise<void> {
    if (productIds.length === 0) return
    try { await rpc((cb) => this.client.batchSetProductStoreStatus({ storeId, productIds, status }, cb)) }
    catch (error) { throw mapError(error, 'product') }
  }
}

export class GrpcCustomizationRepository implements CustomizationRepository {
  public constructor(private readonly client: ProductRpcClient) {}

  public async findActiveItemsByProductId(productId: number): Promise<CustomizationItem[]> {
    try {
      const response = await rpc((cb) => this.client.listCustomizationItems({ productId, page: 1, pageSize: 100, status: CustomizationItemStatus.keyMap.ACTIVE, name: '' }, cb))
      return response.items.map(itemModel)
    } catch (error) { throw mapError(error, 'customization') }
  }

  public async findActiveOptionsByItemIds(itemIds: readonly number[]): Promise<CustomizationOption[]> {
    try {
      const lists = await Promise.all(itemIds.map((itemId) => rpc((cb) => this.client.listCustomizationOptions({ itemId, page: 1, pageSize: 100, status: CustomizationOptionGlobalStatus.keyMap.ACTIVE, name: '' }, cb))))
      return lists.flatMap((response) => response.options.map(optionModel))
    } catch (error) { throw mapError(error, 'customization') }
  }

  public async findOptionStoreStatusByStoreId(storeId: number, optionIds: readonly number[]): Promise<Map<number, CustomizationOptionStoreStatusCode>> {
    const result = new Map<number, CustomizationOptionStoreStatusCode>(optionIds.map((id) => [id, CustomizationOptionStoreStatus.keyMap.DISABLED]))
    if (optionIds.length === 0) return result
    try {
      const response = await rpc((cb) => this.client.getCustomizationOptionStoreStatuses({ storeId, optionIds }, cb))
      for (const row of response.options) result.set(Number(row.optionId), CustomizationOptionStoreStatus.schema().parse(row.storeStatus) as CustomizationOptionStoreStatusCode)
      return result
    } catch (error) { throw mapError(error, 'customization') }
  }

  public async upsertOptionStoreStatus(optionId: number, storeId: number, status: CustomizationOptionStoreStatusCode): Promise<void> {
    try { await rpc((cb) => this.client.batchSetCustomizationOptionStoreStatus({ storeId, optionIds: [optionId], status }, cb)) }
    catch (error) { throw mapError(error, 'customization') }
  }
}

export function createProductRpcRepositories(): { product: GrpcProductRepository; customization: GrpcCustomizationRepository; close: () => void } {
  const client = createClient()
  return {
    product: new GrpcProductRepository(client),
    customization: new GrpcCustomizationRepository(client),
    close: () => client.close(),
  }
}
