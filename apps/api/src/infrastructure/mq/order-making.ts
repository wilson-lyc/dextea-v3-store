import { getConfig } from '@/config/index.js'
import { getLogger } from '@/shared/logger.js'
import { orderEventHub, type OrderStatusEvent } from '@/modules/order/order-events.service.js'
import { ConsumeResult, createMqClient, sendMqMessage } from './client.js'
import type { MessageView } from 'rocketmq-client-nodejs'
import type { MqClient, MqMessage, MqSubscription } from './types.js'

const logger = getLogger()

const PENDING_TO_PREPARING_TAG = 'PENDING_TO_PREPARING'

let client: MqClient | null = null

function parseOrderStatusEvent(message: MessageView): OrderStatusEvent | null {
  const tag = message.getTag()
  if (tag !== PENDING_TO_PREPARING_TAG) return null

  try {
    const payload = JSON.parse(message.getBody().toString('utf8')) as Partial<OrderStatusEvent>
    if (
      typeof payload.orderId !== 'number' ||
      typeof payload.storeId !== 'number' ||
      typeof payload.orderNo !== 'string'
    ) {
      logger.warn({ tag }, '[MQ:order-making] 消息体缺少关键字段，已忽略')
      return null
    }
    return payload as OrderStatusEvent
  } catch (error) {
    logger.error({ error }, '[MQ:order-making] 消息体解析失败')
    return null
  }
}

function buildSubscriptions(topic: string): MqSubscription[] {
  return [
    {
      topic,
      handler: async (message) => {
        logger.info(`[MQ:order-making] received message ${message.getMessageId()}`)

        const event = parseOrderStatusEvent(message)
        if (event) {
          orderEventHub.publish(event.storeId, event)
          logger.info(
            { orderNo: event.orderNo, storeId: event.storeId },
            '[MQ:order-making] PENDING_TO_PREPARING 已推送至门店 SSE'
          )
        }
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
  const receipt = await sendMqMessage(
    client.producer,
    getConfig().mq.orderMaking.topic,
    message
  )
  return receipt.messageId
}
