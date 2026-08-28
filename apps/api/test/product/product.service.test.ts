import { describe, expect, it } from 'vitest'
import { productStoreStatusCode } from '@dextea/constraints'
import { ProductService } from '@/modules/product/product.service.js'
import {
  FakeProductRepository,
  buildProduct,
  TEST_STORE_ID,
} from '../helpers/fakes.js'

describe('商品服务', () => {
  it('未配置门店状态的商品回退为售罄', async () => {
    const repository = new FakeProductRepository()
    repository.products = [buildProduct(1)]
    const service = new ProductService(repository)

    const result = await service.listActiveByStore(TEST_STORE_ID)

    expect(result).toHaveLength(1)
    expect(result[0]?.storeStatus).toBe(productStoreStatusCode.STORE_DISABLED)
  })

  it('切换门店状态时在可售与售罄之间取反', async () => {
    const repository = new FakeProductRepository()
    repository.statusMap.set(1, productStoreStatusCode.STORE_ACTIVE)
    const service = new ProductService(repository)

    const first = await service.toggleStoreStatus(TEST_STORE_ID, 1)
    expect(first).toBe(productStoreStatusCode.STORE_DISABLED)

    repository.statusMap.set(1, productStoreStatusCode.STORE_DISABLED)
    const second = await service.toggleStoreStatus(TEST_STORE_ID, 1)
    expect(second).toBe(productStoreStatusCode.STORE_ACTIVE)

    expect(repository.setStatusCalls).toHaveLength(2)
  })

  it('批量更新直接委托到仓储', async () => {
    const repository = new FakeProductRepository()
    const service = new ProductService(repository)

    await service.batchSetStoreStatus(TEST_STORE_ID, [1, 2], productStoreStatusCode.STORE_ACTIVE)

    expect(repository.batchCalls).toHaveLength(1)
    expect(repository.batchCalls[0]?.productIds).toEqual([1, 2])
  })
})
