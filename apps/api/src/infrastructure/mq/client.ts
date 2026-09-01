import {
  PushConsumer,
  FilterExpression,
  ConsumeResult,
  type MessageView,
  type SessionCredentials,
} from 'rocketmq-client-nodejs'
import { getLogger } from '@/shared/logger.js'
import type { MqConfig } from '@/config/index.js'
import type { MqClient, MqSubscription } from './types.js'

const logger = getLogger()

function buildSessionCredentials(mqConfig: MqConfig): SessionCredentials {
  return {
    accessKey: mqConfig.accessKey,
    accessSecret: mqConfig.secretKey,
  }
}

/**
 * 本服务只消费订单状态消息、不生产消息，因此只建立 PushConsumer，
 * 不再创建闲置的 Producer 连接。
 */
export function createMqClient(options: {
  config: MqConfig
  subscriptions: MqSubscription[]
}): MqClient {
  const { config: mqConfig, subscriptions } = options
  const sessionCredentials = buildSessionCredentials(mqConfig)

  const subscriptionMap = new Map<string, FilterExpression | string>()
  for (const subscription of subscriptions) {
    subscriptionMap.set(
      subscription.topic,
      subscription.expression ?? FilterExpression.SUB_ALL
    )
  }

  const consumer = new PushConsumer({
    consumerGroup: mqConfig.consumerGroup,
    endpoints: mqConfig.endpoints,
    namespace: mqConfig.namespace,
    sessionCredentials,
    subscriptions: subscriptionMap,
    messageListener: {
      consume: (message: MessageView) => {
        const matched = subscriptions.find((s) => s.topic === message.getTopic())
        if (!matched) return ConsumeResult.SUCCESS
        return matched.handler(message)
      },
    },
  })

  return {
    async start() {
      await consumer.startup()
      logger.info(`[MQ] ${mqConfig.topic} consumer started`)
    },
    async shutdown() {
      await consumer.shutdown()
      logger.info(`[MQ] ${mqConfig.topic} consumer stopped`)
    },
  }
}

export { ConsumeResult }
