import { getConfig } from '@/config/index.js'
import { getLogger } from '@/shared/logger.js'
import { screenEventHub } from '@/modules/screen/screen.service.js'
import { ConsumeResult, createMqClient } from './client.js'
import type { MqClient, MqSubscription } from './types.js'

const logger = getLogger()

let client: MqClient | null = null

interface OrderStatusMessage {
  pickupCode?: unknown
}

function buildSubscriptions(topic: string, tag: string): MqSubscription[] {
  return [
    {
      topic,
      expression: tag,
      handler: async (message) => {
        try {
          const payload = JSON.parse(message.getBody().toString('utf-8')) as OrderStatusMessage
          const pickupCode = payload.pickupCode
          if (typeof pickupCode !== 'string' || pickupCode === '') {
            logger.warn(
              { messageId: message.getMessageId() },
              '[MQ:screen-ready] 消息缺少取餐码，已忽略'
            )
            return ConsumeResult.SUCCESS
          }
          logger.info(
            { messageId: message.getMessageId(), pickupCode },
            '[MQ:screen-ready] 出餐消息已转发到大屏'
          )
          screenEventHub.publishReady(pickupCode)
        } catch (error) {
          logger.error({ error }, '[MQ:screen-ready] 消息解析失败')
        }
        return ConsumeResult.SUCCESS
      },
    },
  ]
}

export function isScreenReadyMqEnabled(): boolean {
  return getConfig().mq.screenReady.enabled
}

export async function startScreenReadyMq(): Promise<void> {
  const mqConfig = getConfig().mq.screenReady

  if (!mqConfig.enabled) {
    logger.info('[MQ:screen-ready] disabled, skip bootstrap')
    return
  }
  if (client) return

  client = createMqClient({
    config: mqConfig,
    subscriptions: buildSubscriptions(mqConfig.topic, mqConfig.tag ?? 'PREPARING_TO_READY'),
  })
  await client.start()
}

export async function stopScreenReadyMq(): Promise<void> {
  if (!client) return
  await client.shutdown()
  client = null
}
