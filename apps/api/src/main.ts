import { getConfig } from '@/config/index.js'
import { getLogger } from '@/shared/logger.js'
import { closeDatabase } from '@/infrastructure/database/pool.js'
import {
  startOrderMakingMq,
  stopOrderMakingMq,
} from '@/infrastructure/mq/order-making.js'
import {
  closeNacosNamingClient,
  getNacosNamingClient,
  isNacosDiscoveryEnabled,
} from '@/infrastructure/nacos/naming-client.js'
import { createOrderServiceEndpointResolver } from '@/infrastructure/external/order-endpoint.resolver.js'
import { buildApp } from '@/app.js'

async function startNacosDiscovery(): Promise<void> {
  const logger = getLogger()

  if (!isNacosDiscoveryEnabled()) {
    logger.info('[nacos] 服务发现未启用，订单微服务地址取自 ORDER_SERVICE_BASE_URL')
    return
  }

  try {
    await getNacosNamingClient()
    const baseUrl = await createOrderServiceEndpointResolver().resolveBaseUrl()
    logger.info(
      { serviceName: getConfig().orderService.serviceName, baseUrl },
      '[nacos] 订单微服务地址已解析'
    )
  } catch (error) {
    logger.error({ error }, '[nacos] 订单微服务地址解析失败，将在每次调用时重试')
  }
}

async function bootstrap(): Promise<void> {
  const config = getConfig()
  const logger = getLogger()
  const app = await buildApp()

  try {
    await startOrderMakingMq()
  } catch (error) {
    logger.error({ error }, '[mq] 订单制作 MQ 启动失败')
  }

  await startNacosDiscovery()

  let shuttingDown = false
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return
    shuttingDown = true

    logger.info({ signal }, '[main] 正在关闭服务...')

    await stopOrderMakingMq().catch(() => undefined)
    await app.close().catch(() => undefined)
    await closeNacosNamingClient()
    await closeDatabase().catch(() => undefined)

    process.exit(0)
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))

  try {
    await app.listen({ port: config.server.port, host: config.server.host })
  } catch (error) {
    logger.error({ error }, '[main] 服务启动失败')
    process.exit(1)
  }
}

bootstrap().catch((error: unknown) => {
  getLogger().error({ error }, '[main] 启动过程发生未捕获异常')
  process.exit(1)
})
