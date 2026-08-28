import { afterEach, describe, expect, it } from 'vitest'
import { apiRoutes } from '@dextea/constraints'
import { authHeaders, createTestApp, type TestApp } from '../helpers/app.js'

let current: TestApp | undefined

async function getApp(): Promise<TestApp> {
  if (!current) {
    current = await createTestApp()
  }
  return current
}

afterEach(async () => {
  if (current) {
    await current.app.close()
    current = undefined
  }
})

describe('前后端接口契约', () => {
  it('前端调用的所有路由都必须在后端存在（不返回 404）', async () => {
    const { app, token } = await getApp()

    const requests = [
      { method: 'POST' as const, url: apiRoutes.auth.login(), payload: { account: 'a', password: 'b' } },
      { method: 'GET' as const, url: apiRoutes.store.current() },
      { method: 'PUT' as const, url: apiRoutes.store.status(), payload: { status: 1 } },
      {
        method: 'PUT' as const,
        url: apiRoutes.store.password(),
        payload: { oldPassword: 'old123456', newPassword: 'new123456' },
      },
      { method: 'GET' as const, url: apiRoutes.product.list() },
      { method: 'PATCH' as const, url: apiRoutes.product.storeStatus(1), payload: {} },
      {
        method: 'POST' as const,
        url: apiRoutes.product.batchStoreStatus(),
        payload: { productIds: [1, 2], status: 1 },
      },
      { method: 'GET' as const, url: apiRoutes.customization.listByProduct(1) },
      {
        method: 'PATCH' as const,
        url: apiRoutes.customization.optionStoreStatus(20),
        payload: { status: 1 },
      },
      { method: 'GET' as const, url: apiRoutes.order.window() },
      { method: 'GET' as const, url: apiRoutes.order.detail(100) },
      { method: 'POST' as const, url: apiRoutes.order.ready(100), payload: {} },
      { method: 'POST' as const, url: apiRoutes.order.collect(100), payload: {} },
    ]

    for (const request of requests) {
      const response = await app.inject({
        method: request.method,
        url: request.url,
        headers: authHeaders(token),
        payload: 'payload' in request ? request.payload : undefined,
      })

      expect(
        response.statusCode,
        `${request.method} ${request.url} 命中 404，前后端契约不一致`,
      ).not.toBe(404)
    }
  })

  it('健康检查与文档路由无需鉴权即可访问', async () => {
    const { app } = await getApp()

    const health = await app.inject({ method: 'GET', url: '/health' })
    expect(health.statusCode).toBe(200)

    const docs = await app.inject({ method: 'GET', url: '/docs/json' })
    expect(docs.statusCode).toBe(200)
  })
})
