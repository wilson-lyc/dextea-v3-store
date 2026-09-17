import path from 'node:path'
import { credentials, loadPackageDefinition, type Client, status as grpcStatus } from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import type { OrderDetailData, OrderMakingBoardData, OrderWindowData } from '@dextea/constraints'
import { getConfig } from '@/config/index.js'
import { getLogger } from '@/shared/logger.js'
import type { OrderGateway, OrderGatewayRequest } from '@/modules/order/order.gateway.js'
import { UpstreamServiceError } from './order-service.client.js'

type Callback<T> = (error: Error | null, response: T) => void
interface RpcWindowItem { orderId: string; orderNo: string; pickupCode: string; totalPrice: number; totalQuantity: number; diningMethod: number; makingStatus: number; paymentStatus: number; createdAt: string }
interface RpcWindowResponse { items: RpcWindowItem[]; total: string }
interface RpcBoardResponse { preparingPickupCodes: string[]; readyPickupCodes: string[]; preparingOrderCount: string; preparingProductQuantity: number }
interface RpcDetailItem { id: string; productId: string; [key: string]: string | number | boolean | null }
interface RpcDetailResponse { id: string; storeId: string; items: RpcDetailItem[]; [key: string]: string | number | boolean | RpcDetailItem[] | null }
type RpcClient = Client & {
  getStoreWindowOrders(request: object, cb: Callback<RpcWindowResponse>): void
  getStoreMakingBoard(request: object, cb: Callback<RpcBoardResponse>): void
  getStoreOrderDetail(request: object, cb: Callback<RpcDetailResponse>): void
  markOrderReady(request: object, cb: Callback<unknown>): void
  markOrderCollected(request: object, cb: Callback<unknown>): void
}

function call<T>(operation: (cb: Callback<T>) => void): Promise<T> {
  return new Promise((resolve, reject) => operation((error, response) => error ? reject(error) : resolve(response)))
}

function protoPath(): string {
  return process.env.ORDER_SERVICE_PROTO_PATH?.trim() ||
    path.resolve(process.cwd(), '../../../dextea-proto/proto/order/v1/order.proto')
}

function createClient(): RpcClient {
  const definition = protoLoader.loadSync(protoPath(), { keepCase: false, longs: String, defaults: true, oneofs: true })
  const packages = loadPackageDefinition(definition) as unknown as {
    dextea: { order: { v1: { OrderService: new (address: string, creds: ReturnType<typeof credentials.createInsecure>) => RpcClient } } }
  }
  return new packages.dextea.order.v1.OrderService(getConfig().orderService.rpcAddress, credentials.createInsecure())
}

export class GrpcOrderGateway implements OrderGateway {
  private readonly client = createClient()
  private readonly logger = getLogger()

  public async getOrderWindow(request: OrderGatewayRequest): Promise<OrderWindowData> {
    try {
      const result = await call<RpcWindowResponse>((cb) => this.client.getStoreWindowOrders({ storeId: request.storeId, hours: 3 }, cb))
      return { items: result.items.map((item) => ({ ...item, orderId: Number(item.orderId) })), total: Number(result.total) }
    } catch (error) { throw this.mapError(error, '查询订单窗口') }
  }

  public async getMakingBoard(request: OrderGatewayRequest): Promise<OrderMakingBoardData> {
    try {
      const result = await call<RpcBoardResponse>((cb) => this.client.getStoreMakingBoard({ storeId: request.storeId }, cb))
      return { preparingPickupCodes: result.preparingPickupCodes, readyPickupCodes: result.readyPickupCodes, preparingOrderCount: Number(result.preparingOrderCount), preparingProductQuantity: result.preparingProductQuantity }
    } catch (error) { throw this.mapError(error, '查询制作看板') }
  }

  public async getOrderDetail(request: OrderGatewayRequest, orderId: number): Promise<OrderDetailData> {
    try {
      const result = await call<RpcDetailResponse>((cb) => this.client.getStoreOrderDetail({ storeId: request.storeId, orderId }, cb))
      return { ...result, id: Number(result.id), storeId: Number(result.storeId), items: result.items.map((item) => ({ ...item, id: Number(item.id), productId: Number(item.productId) })) } as OrderDetailData
    } catch (error) { throw this.mapError(error, '查询订单详情') }
  }

  public async markOrderReady(request: OrderGatewayRequest, orderId: number): Promise<null> {
    try { await call((cb) => this.client.markOrderReady({ storeId: request.storeId, orderId }, cb)); return null }
    catch (error) { throw this.mapError(error, '标记订单完成') }
  }

  public async markOrderCollected(request: OrderGatewayRequest, orderId: number): Promise<null> {
    try { await call((cb) => this.client.markOrderCollected({ storeId: request.storeId, orderId }, cb)); return null }
    catch (error) { throw this.mapError(error, '标记订单取餐') }
  }

  public close(): void { this.client.close() }

  private mapError(error: unknown, operation: string): UpstreamServiceError {
    const code = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: number }).code : undefined
    this.logger.error({ error, operation, code }, '[order-rpc] 调用订单微服务失败')
    const status = code === grpcStatus.UNAUTHENTICATED ? 401 : code === grpcStatus.NOT_FOUND ? 404 : undefined
    return new UpstreamServiceError('order-service', status, undefined, '订单服务暂时不可用')
  }
}
