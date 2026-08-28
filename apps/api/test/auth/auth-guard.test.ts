import jwt from 'jsonwebtoken'
import { afterEach, describe, expect, it } from 'vitest'
import { apiRoutes } from '@dextea/constraints'
import { authHeaders, createTestApp, type TestApp } from '../helpers/app.js'
import { FakeStoreRepository } from '../helpers/fakes.js'
import { StoreService } from '@/modules/store/store.service.js'
import { BizError, commonErrors } from '@/shared/errors.js'
import { storeErrors } from '@/modules/store/store.error.js'
import { JwtTokenService } from '@/modules/auth/token.service.js'

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

describe('鉴权与租户隔离', () => {
  it('未携带令牌访问受保护路由时返回 401', async () => {
    const { app } = await getApp()

    const response = await app.inject({ method: 'GET', url: apiRoutes.store.current() })

    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe(commonErrors.UNAUTHORIZED.code)
  })

  it('无效令牌返回 401 且业务码为 TOKEN_INVALID', async () => {
    const { app } = await getApp()

    const response = await app.inject({
      method: 'GET',
      url: apiRoutes.store.current(),
      headers: authHeaders('not-a-real-token'),
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe(commonErrors.TOKEN_INVALID.code)
  })

  it('过期的令牌返回 401 且业务码为 TOKEN_EXPIRED', async () => {
    const { app } = await getApp()
    const token = jwt.sign({ storeId: '7' }, 'test-secret-for-unit-tests', { expiresIn: '-1s' })

    const response = await app.inject({
      method: 'GET',
      url: apiRoutes.store.current(),
      headers: authHeaders(token),
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe(commonErrors.TOKEN_EXPIRED.code)
  })

  it('令牌载荷被篡改时返回 401', async () => {
    const { app } = await getApp()
    const token = jwt.sign({ storeId: 'not-a-number' }, 'test-secret-for-unit-tests', {
      expiresIn: '1h',
    })

    const response = await app.inject({
      method: 'GET',
      url: apiRoutes.store.current(),
      headers: authHeaders(token),
    })

    expect(response.statusCode).toBe(401)
  })

  it('客户端伪造的 X-Store-Id 请求头不会生效', async () => {
    const { app, token } = await getApp()

    const response = await app.inject({
      method: 'GET',
      url: apiRoutes.store.current(),
      headers: { ...authHeaders(token), 'x-store-id': '999999' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().data.id).toBe(7)
  })

  it('登录路由是公开的，无需令牌', async () => {
    const { app } = await getApp()

    const response = await app.inject({
      method: 'POST',
      url: apiRoutes.auth.login(),
      payload: { account: 'unknown', password: 'whatever' },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('INVALID_CREDENTIALS')
  })

  it('令牌服务只接受正整数门店标识', () => {
    const tokenService = new JwtTokenService('test-secret-for-unit-tests', '1h')

    expect(() => tokenService.verifyToken(jwt.sign({ storeId: '0' }, 'test-secret-for-unit-tests'))).toThrow(
      BizError,
    )
  })
})

describe('门店服务', () => {
  it('门店不存在时抛出 STORE_NOT_FOUND', async () => {
    const repository = new FakeStoreRepository()
    const service = new StoreService(repository)

    await expect(service.getById(1)).rejects.toMatchObject({ code: storeErrors.STORE_NOT_FOUND.code })
  })

  it('状态更新未影响任何行时抛出 STORE_NOT_FOUND', async () => {
    const repository = new FakeStoreRepository()
    repository.updateStatusResult = false
    const service = new StoreService(repository)

    await expect(service.updateStatus(1, 1)).rejects.toMatchObject({
      code: storeErrors.STORE_NOT_FOUND.code,
    })
  })

  it('拒绝更新为不受支持的门店状态', async () => {
    const repository = new FakeStoreRepository()
    const service = new StoreService(repository)

    await expect(service.updateStatus(1, 2 as never)).rejects.toMatchObject({
      code: storeErrors.INVALID_STORE_STATUS.code,
    })
    expect(repository.statusUpdates).toHaveLength(0)
  })
})
