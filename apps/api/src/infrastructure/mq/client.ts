import {
  Producer,
  PushConsumer,
  FilterExpression,
  ConsumeResult,
  type MessageView,
  type SessionCredentials,
  type MessageOptions,
  type SendReceipt,
} from 'rocketmq-client-nodejs'
import { getLogger } from '@/shared/logger.js'
import type { MqConfig } from '@/config/index.js'
import type { MqClient, MqMessage, MqSubscription } from './types.js'

const logger = getLogger()

function buildSessionCredentials(mqConfig: MqConfig): SessionCredentials {
  return {
    accessKey: mqConfig.accessKey,
    accessSecret: mqConfig.secretKey,
  }
}

function toMessageOptions(message: MqMessage): MessageOptions {
  const body = Buffer.isBuffer(message.body) ? message.body : Buffer.from(message.body)
  return {
    topic: '',
    body,
    tag: message.tag,
    keys: message.keys,
    messageGroup: message.messageGroup,
    properties: message.properties,
    delay: message.delay,
    deliveryTimestamp: message.deliveryTimestamp,
  }
}

export function createMqClient(options: {
  config: MqConfig
  subscriptions: MqSubscription[]
}): MqClient {
  const { config: mqConfig, subscriptions } = options
  const sessionCredentials = buildSessionCredentials(mqConfig)

  const producer = new Producer({
    endpoints: mqConfig.endpoints,
    namespace: mqConfig.namespace,
    sessionCredentials,
    topic: mqConfig.topic,
  })

  const subscriptionMap = new Map<string, FilterExpression | string>()
  for (const subscription of subscriptions) {
    subscriptionMap.set(subscription.topic, subscription.expression ?? FilterExpression.SUB_ALL)
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
    producer,
    async start() {
      await producer.startup()
      await consumer.startup()
      logger.info(`[MQ] ${mqConfig.topic} producer & consumer started`)
    },
    async shutdown() {
      await producer.shutdown()
      await consumer.shutdown()
      logger.info(`[MQ] ${mqConfig.topic} producer & consumer stopped`)
    },
  }
}

export function sendMqMessage(
  producer: Producer,
  topic: string,
  message: MqMessage,
): Promise<SendReceipt> {
  const options = toMessageOptions(message)
  options.topic = topic
  return producer.send(options)
}

export { ConsumeResult }
