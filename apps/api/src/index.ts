import { config } from '@/config.js'
import { logger } from '@/shared/utils/logger.js'
import { createApp } from '@/app.js'
import { startOrderMakingMq, stopOrderMakingMq } from '@/shared/mq/index.js'

async function bootstrap(): Promise<void> {
  const app = createApp()

  try {
    await startOrderMakingMq()
  } catch (error) {
    logger.error('订单制作 MQ 启动失败', error)
  }

  const shutdown = async (): Promise<void> => {
    logger.info('正在关闭服务...')
    await stopOrderMakingMq().catch(() => undefined)
    await app.close().catch(() => undefined)
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  app.listen({ port: config.port, host: '0.0.0.0' }, (err) => {
    if (err) {
      logger.error('服务启动失败', err)
      process.exit(1)
    }
    logger.info(`服务已启动: http://0.0.0.0:${config.port}`)
  })
}

bootstrap().catch((err) => {
  logger.error('启动过程发生未捕获异常', err)
  process.exit(1)
})
