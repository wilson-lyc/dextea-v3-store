import { afterEach, describe, expect, it } from 'vitest'
import { apiRoutes, SUCCESS_CODE } from '@dextea/constraints'
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

describe('统一响应与错误处理', () => {
  it('成功响应使用统一包络', async () => {
    const { app, token } = await getApp()

    const response = await app.inject({
      method: 'GET',
      url: apiRoutes.product.list(),
      headers: authHeaders(token),
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.code).toBe(SUCCESS_CODE)
    expect(body.message).toBe('success')
    expect(Array.isArray(body.data)).toBe(true)
  })

  it('参数校验失败时返回 400 与 VALIDATION_FAILED', async () => {
    const { app } = await getApp()

    const response = await app.inject({
      method: 'POST',
      url: apiRoutes.auth.login(),
      payload: { account: '', password: '' },
    })

    expect(response.statusCode).toBe(400)
    const body = response.json()
    expect(body.code).toBe('VALIDATION_FAILED')
    expect(body.data).toBeNull()
    expect(typeof body.message).toBe('string')
  })

  it('批量操作传入空数组时被拒绝', async () => {
    const { app, token } = await getApp()

    const response = await app.inject({
      method: 'POST',
      url: apiRoutes.product.batchStoreStatus(),
      headers: authHeaders(token),
      payload: { productIds: [], status: 1 },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().code).toBe('VALIDATION_FAILED')
  })

  it('批量操作传入非法状态码时被拒绝', async () => {
    const { app, token } = await getApp()

    const response = await app.inject({
      method: 'POST',
      url: apiRoutes.product.batchStoreStatus(),
      headers: authHeaders(token),
      payload: { productIds: [1], status: 99 },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().code).toBe('VALIDATION_FAILED')
  })

  it('路径参数非法时被拒绝', async () => {
    const { app, token } = await getApp()

    const response = await app.inject({
      method: 'GET',
      url: apiRoutes.customization.listByProduct(-1),
      headers: authHeaders(token),
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().code).toBe('VALIDATION_FAILED')
  })

  it('未定义的路由返回 404 统一包络', async () => {
    const { app } = await getApp()

    const response = await app.inject({ method: 'GET', url: '/api/v1/not-exist' })

    expect(response.statusCode).toBe(404)
    expect(response.json().code).toBe('ROUTE_NOT_FOUND')
  })

  it('业务错误携带正确的 HTTP 状态码', async () => {
    const { app, token } = await getApp()

    const response = await app.inject({
      method: 'PATCH',
      url: apiRoutes.customization.optionStoreStatus(999999),
      headers: authHeaders(token),
      payload: { status: 1 },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().code).toBe('OPTION_NOT_FOUND')
  })
})
