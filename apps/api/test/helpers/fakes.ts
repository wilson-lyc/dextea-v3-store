import {
  CustomizationItemStatus,
  CustomizationOptionGlobalStatus,
  ProductGlobalStatus,
  StoreStatus,
  type CustomizationItemStatusCode,
  type CustomizationOptionGlobalStatusCode,
  type CustomizationOptionStoreStatusCode,
  type OrderDetailData,
  type OrderWindowData,
  type ProductGlobalStatusCode,
  type ProductStoreStatusCode,
  type StoreStatusCode,
} from '@dextea/constraints'
import type { StoreRepository } from '@/modules/store/store.repository.js'
import type { ProductRepository } from '@/modules/product/product.repository.js'
import type { CustomizationRepository } from '@/modules/customization/customization.repository.js'
import type { OrderGateway, OrderGatewayRequest } from '@/modules/order/order.gateway.js'
import { Store } from '@/modules/store/store.model.js'
import { Product } from '@/modules/product/product.model.js'
import { CustomizationItem, CustomizationOption } from '@/modules/customization/customization.model.js'

export const TEST_STORE_ID = 7
export const TEST_STORE_ACCOUNT = 'store-account'
export const TEST_PASSWORD_HASH = 'hashed-password'

export function buildStore(): Store {
  return new Store(
    TEST_STORE_ID,
    TEST_STORE_ACCOUNT,
    TEST_PASSWORD_HASH,
    '测试门店',
    '广东省',
    '深圳市',
    '南山区',
    '科技园路 1 号',
    StoreStatus.keyMap.OPEN as StoreStatusCode,
    '09:00-22:00',
    '13800000000',
    114.05,
    22.54,
    'store@example.com',
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00',
  )
}

export class FakeStoreRepository implements StoreRepository {
  public stores: Store[] = []
  public statusUpdates: Array<{ id: number; status: StoreStatusCode }> = []
  public passwordUpdates: Array<{ id: number; passwordHash: string }> = []
  public updateStatusResult = true
  public updatePasswordResult = true

  public async findById(id: number): Promise<Store | null> {
    return this.stores.find((store) => store.id === id) ?? null
  }

  public async findByAccount(account: string): Promise<Store | null> {
    return this.stores.find((store) => store.account === account) ?? null
  }

  public async updateStatus(id: number, status: StoreStatusCode): Promise<boolean> {
    this.statusUpdates.push({ id, status })
    return this.updateStatusResult
  }

  public async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    this.passwordUpdates.push({ id, passwordHash })
    return this.updatePasswordResult
  }
}

export class FakeProductRepository implements ProductRepository {
  public products: Product[] = []
  public statusMap = new Map<number, ProductStoreStatusCode>()
  public setStatusCalls: Array<{ storeId: number; productId: number; status: ProductStoreStatusCode }> =
    []
  public batchCalls: Array<{
    storeId: number
    productIds: readonly number[]
    status: ProductStoreStatusCode
  }> = []

  public async findGloballyActive(): Promise<Product[]> {
    return this.products
  }

  public async findStoreStatusByStoreId(
    _storeId: number,
    productIds: readonly number[],
  ): Promise<Map<number, ProductStoreStatusCode>> {
    const result = new Map<number, ProductStoreStatusCode>()
    for (const productId of productIds) {
      const status = this.statusMap.get(productId)
      if (status !== undefined) {
        result.set(productId, status)
      }
    }
    return result
  }

  public async setStoreStatus(
    storeId: number,
    productId: number,
    status: ProductStoreStatusCode,
  ): Promise<void> {
    this.setStatusCalls.push({ storeId, productId, status })
  }

  public async batchSetStoreStatus(
    storeId: number,
    productIds: readonly number[],
    status: ProductStoreStatusCode,
  ): Promise<void> {
    this.batchCalls.push({ storeId, productIds, status })
  }
}

export function buildProduct(id: number, name = '测试商品'): Product {
  return new Product(
    id,
    name,
    '商品描述',
    19.9,
    ProductGlobalStatus.keyMap.ACTIVE as ProductGlobalStatusCode,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00',
  )
}

export class FakeCustomizationRepository implements CustomizationRepository {
  public items: CustomizationItem[] = []
  public options: CustomizationOption[] = []
  public statusMap = new Map<number, CustomizationOptionStoreStatusCode>()
  public upserts: Array<{
    optionId: number
    storeId: number
    status: CustomizationOptionStoreStatusCode
  }> = []

  public async findActiveItemsByProductId(productId: number): Promise<CustomizationItem[]> {
    return this.items.filter((item) => item.productId === productId)
  }

  public async findActiveOptionsByItemIds(itemIds: readonly number[]): Promise<CustomizationOption[]> {
    return this.options.filter((option) => itemIds.includes(option.itemId))
  }

  public async findOptionStoreStatusByStoreId(
    _storeId: number,
    optionIds: readonly number[],
  ): Promise<Map<number, CustomizationOptionStoreStatusCode>> {
    const result = new Map<number, CustomizationOptionStoreStatusCode>()
    for (const optionId of optionIds) {
      const status = this.statusMap.get(optionId)
      if (status !== undefined) {
        result.set(optionId, status)
      }
    }
    return result
  }

  public async findOptionById(optionId: number): Promise<CustomizationOption | null> {
    return this.options.find((option) => option.id === optionId) ?? null
  }

  public async upsertOptionStoreStatus(
    optionId: number,
    storeId: number,
    status: CustomizationOptionStoreStatusCode,
  ): Promise<void> {
    this.upserts.push({ optionId, storeId, status })
  }
}

export function buildCustomizationItem(id: number, productId: number): CustomizationItem {
  return new CustomizationItem(
    id,
    productId,
    '甜度',
    1,
    CustomizationItemStatus.keyMap.ACTIVE as CustomizationItemStatusCode,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00',
  )
}

export function buildCustomizationOption(id: number, itemId: number): CustomizationOption {
  return new CustomizationOption(
    id,
    itemId,
    '少糖',
    0,
    1,
    CustomizationOptionGlobalStatus.keyMap.ACTIVE as CustomizationOptionGlobalStatusCode,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00',
  )
}

export function buildOrderWindow(): OrderWindowData {
  return {
    items: [
      {
        orderId: 100,
        orderNo: 'NO100',
        pickupCode: 'A001',
        totalPrice: 39.8,
        totalQuantity: 2,
        diningMethod: 1,
        makingStatus: 0,
        paymentStatus: 2,
        createdAt: '2026-01-01 00:00:00',
      },
    ],
    total: 1,
  }
}

export function buildOrderDetail(orderId: number): OrderDetailData {
  return {
    id: orderId,
    orderNo: `NO${orderId}`,
    tradeNo: `T${orderId}`,
    storeId: TEST_STORE_ID,
    diningMethod: 1,
    note: null,
    source: 0,
    pickupCode: 'A001',
    makingStatus: 0,
    paymentMethod: 1,
    paymentStatus: 2,
    paymentExpiredAt: null,
    paymentPaidAt: null,
    paymentRefundedAt: null,
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
    totalPrice: 39.8,
    totalQuantity: 2,
    items: [
      {
        id: 1,
        productId: 1,
        productName: '测试商品',
        skuId: 'SKU1',
        customization: null,
        coverUrl: null,
        quantity: 2,
        unitPrice: 19.9,
        totalPrice: 39.8,
        available: true,
      },
    ],
  }
}

export class FakeOrderGateway implements OrderGateway {
  public requests: OrderGatewayRequest[] = []
  public failWith: Error | undefined

  public async getOrderWindow(request: OrderGatewayRequest): Promise<OrderWindowData> {
    this.requests.push(request)
    this.throwIfNeeded()
    return buildOrderWindow()
  }

  public async getOrderDetail(
    request: OrderGatewayRequest,
    orderId: number,
  ): Promise<OrderDetailData> {
    this.requests.push(request)
    this.throwIfNeeded()
    return buildOrderDetail(orderId)
  }

  public async markOrderReady(
    request: OrderGatewayRequest,
    orderId: number,
  ): Promise<OrderDetailData> {
    this.requests.push(request)
    this.throwIfNeeded()
    return buildOrderDetail(orderId)
  }

  public async markOrderCollected(
    request: OrderGatewayRequest,
    orderId: number,
  ): Promise<OrderDetailData> {
    this.requests.push(request)
    this.throwIfNeeded()
    return buildOrderDetail(orderId)
  }

  private throwIfNeeded(): void {
    if (this.failWith) {
      throw this.failWith
    }
  }
}
