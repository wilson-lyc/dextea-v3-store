import type { FastifyInstance } from 'fastify'
import { buildApp, type AppDependencies } from '@/app.js'
import { JwtTokenService } from '@/modules/auth/token.service.js'
import {
  FakeCustomizationRepository,
  FakeOrderGateway,
  FakeProductRepository,
  FakeStoreRepository,
  TEST_STORE_ID,
  buildCustomizationItem,
  buildCustomizationOption,
  buildOrderDetail,
  buildProduct,
  buildStore,
} from './fakes.js'

export interface TestApp {
  app: FastifyInstance
  tokenService: JwtTokenService
  token: string
  storeRepository: FakeStoreRepository
  productRepository: FakeProductRepository
  customizationRepository: FakeCustomizationRepository
  orderGateway: FakeOrderGateway
}

export async function createTestApp(): Promise<TestApp> {
  const storeRepository = new FakeStoreRepository()
  const productRepository = new FakeProductRepository()
  const customizationRepository = new FakeCustomizationRepository()
  const orderGateway = new FakeOrderGateway()
  const tokenService = new JwtTokenService('test-secret-for-unit-tests', '1h')

  storeRepository.stores = [buildStore()]
  productRepository.products = [buildProduct(1), buildProduct(2)]
  customizationRepository.items = [buildCustomizationItem(10, 1)]
  customizationRepository.options = [buildCustomizationOption(20, 10)]

  const dependencies: AppDependencies = {
    storeRepository,
    productRepository,
    customizationRepository,
    orderGateway,
    tokenService,
  }

  const app = await buildApp(dependencies)
  const { token } = tokenService.generateToken({ storeId: TEST_STORE_ID })

  return {
    app,
    tokenService,
    token,
    storeRepository,
    productRepository,
    customizationRepository,
    orderGateway,
  }
}

export function authHeaders(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}` }
}

export { buildOrderDetail }
