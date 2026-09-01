import type { MessageView, ConsumeResult } from 'rocketmq-client-nodejs'

export type MqMessageHandler = (
  message: MessageView
) => ConsumeResult | Promise<ConsumeResult>

export interface MqSubscription {
  topic: string
  expression?: string
  handler: MqMessageHandler
}

export interface MqClient {
  start: () => Promise<void>
  shutdown: () => Promise<void>
}
