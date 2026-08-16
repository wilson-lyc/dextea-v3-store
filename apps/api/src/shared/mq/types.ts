import type { MqConfig } from '@/config.js'
import type { Producer, MessageView } from 'rocketmq-client-nodejs'
import { ConsumeResult } from 'rocketmq-client-nodejs'

export interface MqMessage {
  body: Buffer | string
  tag?: string
  keys?: string[]
  messageGroup?: string
  properties?: Map<string, string>
  delay?: number
  deliveryTimestamp?: Date
}

export type MqMessageHandler = (message: MessageView) => ConsumeResult | Promise<ConsumeResult>

export interface MqSubscription {
  topic: string
  expression?: string
  handler: MqMessageHandler
}

export interface CreateMqClientOptions {
  config: MqConfig
  subscriptions: MqSubscription[]
}

export interface MqClient {
  producer: Producer
  start: () => Promise<void>
  shutdown: () => Promise<void>
}
