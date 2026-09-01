import { orderStatusEventSchema, type OrderStatusEvent } from '@dextea/constraints'
import { getConfig } from '@/config/index.js'
import { getLogger } from '@/shared/logger.js'
import { storeEventHub } from '@/modules/store-event/store-event.service.js'
import { ConsumeResult, createMqClient } from './client.js'
import type { MessageView } from 'rocketmq-client-nodejs'
import type { MqClient, MqSubscription } from './types.js'

const logger = getLogger()

let client: MqClient | null = null

function parseOrderStatusEvent(message: MessageView): OrderStatusEvent | null {
  const tag = message.getTag()

  let body: unknown
  try {
    body = JSON.parse(message.getBody().toString('utf8'))
  } catch (error) {
    logger.error(
      { error, messageId: message.getMessageId() },
      '[MQ:order-making] 消息体解析失败'
    )
    return null
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    logger.warn(
      { messageId: message.getMessageId(), tag },
      '[MQ:order-making] 消息体不是对象，已忽略'
    )
    return null
  }

  const parsed = orderStatusEventSchema.safeParse({ ...body, tag })
  if (!parsed.success) {
    logger.warn(
      { messageId: message.getMessageId(), tag, issues: parsed.error.issues },
      '[MQ:order-making] 消息体缺少关键字段或 tag 不受支持，已忽略'
    )
    return null
  }
  return parsed.data
}

function buildSubscriptions(topic: string): MqSubscription[] {
  return [
    {
      topic,
      handler: async (message) => {
        const event = parseOrderStatusEvent(message)
        if (!event) return ConsumeResult.SUCCESS

        storeEventHub.publish(event)
        logger.info(
          { tag: event.tag, orderNo: event.orderNo, storeId: event.storeId },
          '[MQ:order-making] 订单状态消息已推送至门店 SSE'
        )
        return ConsumeResult.SUCCESS
      },
    },
  ]
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
