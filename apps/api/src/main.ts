import { getConfig } from '@/config/index.js'
import { getLogger } from '@/shared/logger.js'
import { closeDatabase } from '@/infrastructure/database/pool.js'
import {
  startOrderMakingMq,
  stopOrderMakingMq,
} from '@/infrastructure/mq/order-making.js'
import { buildApp } from '@/app.js'

async function bootstrap(): Promise<void> {
  const config = getConfig()
  const logger = getLogger()
  const app = await buildApp()

  try {
    await startOrderMakingMq()
  } catch (error) {
    logger.error({ error }, '[mq] 订单制作 MQ 启动失败')
  }

  let shuttingDown = false
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return
    shuttingDown = true

    logger.info({ signal }, '[main] 正在关闭服务...')

    await stopOrderMakingMq().catch(() => undefined)
    await app.close().catch(() => undefined)
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
