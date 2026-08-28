import { getConfig } from '@/config/index.js'
import { getLogger } from '@/shared/logger.js'
import { ConsumeResult, createMqClient, sendMqMessage } from './client.js'
import type { MqClient, MqMessage, MqSubscription } from './types.js'

const logger = getLogger()

let client: MqClient | null = null

function buildSubscriptions(topic: string): MqSubscription[] {
  return [
    {
      topic,
      handler: async (message) => {
        logger.info(`[MQ:order-making] received message ${message.getMessageId()}`)
        return ConsumeResult.SUCCESS
      },
    },
  ]
}

export function isOrderMakingMqEnabled(): boolean {
  return getConfig().mq.orderMaking.enabled
}

export async function startOrderMakingMq(): Promise<void> {
  const mqConfig = getConfig().mq.orderMaking

  if (!mqConfig.enabled) {
    logger.info('[MQ:order-making] disabled, skip bootstrap')
    return
  }
  if (client) return

  client = createMqClient({
    config: mqConfig,
    subscriptions: buildSubscriptions(mqConfig.topic),
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
  const receipt = await sendMqMessage(client.producer, getConfig().mq.orderMaking.topic, message)
  return receipt.messageId
}
