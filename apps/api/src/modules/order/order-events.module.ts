import type { FastifyPluginAsync } from 'fastify'
import { getConfig } from '@/config/index.js'
import { getLogger } from '@/shared/logger.js'
import { orderEventHub, type OrderStatusEvent } from './order-events.service.js'

/**
 * 门店订单 SSE 通道：GET /api/v1/store/orders/events
 * 鉴权走全局 auth-guard（EventSource 用 ?token= 查询参数），
 * 连接即订阅当前 token 所属门店的订单事件，事件类型 new-order。
 */
export function createOrderEventRoutes(): FastifyPluginAsync {
  return async (app) => {
    app.get('/events', { schema: { hide: true } }, async (request, reply) => {
      const log = getLogger()

      // SSE 直接写 reply.raw 并挂起，绕过了 reply 头序列化，
      // CORS 头需按配置手动写入，否则浏览器跨域拉流会被拦截
      const { cors } = getConfig().server
      const extraHeaders: Record<string, string> = {}
      if (request.headers.origin === cors.origin) {
        extraHeaders['Access-Control-Allow-Origin'] = cors.origin
        if (cors.credentials) {
          extraHeaders['Access-Control-Allow-Credentials'] = 'true'
        }
      }

      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        ...extraHeaders,
      })
      reply.raw.write(`retry: 3000\n\n`)

      // auth-guard 已保证携带有效 token，这里仅满足类型收窄
      const storeId = request.storeId
      if (storeId === undefined) {
        reply.raw.destroy()
        return reply
      }
      const send = (event: OrderStatusEvent) => {
        reply.raw.write(`event: new-order\n`)
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`)
      }
      const unsubscribe = orderEventHub.subscribe(storeId, send)

      const heartbeat = setInterval(() => {
        reply.raw.write(`: ping\n\n`)
      }, 15_000)

      log.info(`[order-events] 门店(${storeId})客户端已接入`)
      const close = () => {
        clearInterval(heartbeat)
        unsubscribe()
        log.info(`[order-events] 门店(${storeId})客户端已断开`)
      }
      reply.raw.on('close', close)
      reply.raw.on('error', close)

      // 挂起请求直到连接关闭，避免 Fastify 走默认 JSON 响应
      await new Promise<void>(() => {})
    })
  }
}
