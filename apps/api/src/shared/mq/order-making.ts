import { config } from '@/config.js'
import { logger } from '@/shared/utils/logger.js'
import { ConsumeResult, createMqClient, sendMqMessage } from './client.js'
import type { MqClient, MqMessage, MqSubscription } from './types.js'

const mqConfig = config.mq.orderMaking

let client: MqClient | null = null

function buildSubscriptions(): MqSubscription[] {
  return [
    {
      topic: mqConfig.topic,
      handler: async (message) => {
        logger.info(`[MQ:order-making] received message ${message.getMessageId()}`)
        return ConsumeResult.SUCCESS
      },
    },
  ]
}

export function isOrderMakingMqEnabled(): boolean {
  return mqConfig.enabled
}

export async function startOrderMakingMq(): Promise<void> {
  if (!mqConfig.enabled) {
    logger.info('[MQ:order-making] disabled, skip bootstrap')
    return
  }
  if (client) return
  client = createMqClient({
    config: mqConfig,
    subscriptions: buildSubscriptions(),
  })
  await client.start()
}

export async function stopOrderMakingMq(): Promise<void> {
  if (!client) return
  await client.shutdown()
  client = null
}

export async function publishOrderMakingMessage(message: MqMessage): Promise<string> {
  if (!client) {
    throw new Error('[MQ:order-making] client not started')
  }
  const receipt = await sendMqMessage(client.producer, mqConfig.topic, message)
  return receipt.messageId
}
