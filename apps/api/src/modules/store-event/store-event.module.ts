import type { ServerResponse } from 'node:http'
import type { FastifyPluginAsync } from 'fastify'
import type { StoreEvent } from '@dextea/constraints'
import { getConfig } from '@/config/index.js'
import { getLogger } from '@/shared/logger.js'
import type { StoreEventHub } from './store-event.service.js'

export interface StoreEventModuleOptions {
  storeEventHub: StoreEventHub
}

const HEARTBEAT_INTERVAL_MS = 15_000

export function createStoreEventRoutes(
  options: StoreEventModuleOptions
): FastifyPluginAsync {
  const { storeEventHub } = options

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

      const storeId = request.storeId
      if (storeId === undefined) {
        reply.raw.destroy()
        return reply
      }

      writeEvent(reply.raw, storeEventHub.snapshot(storeId))

      const send = (event: StoreEvent) => writeEvent(reply.raw, event)
      const unsubscribe = storeEventHub.subscribe(storeId, send)

      const heartbeat = setInterval(() => {
        reply.raw.write(`: ping\n\n`)
      }, HEARTBEAT_INTERVAL_MS)

      log.info(`[store-event] 门店(${storeId})客户端已接入`)
      const close = () => {
        clearInterval(heartbeat)
        unsubscribe()
        log.info(`[store-event] 门店(${storeId})客户端已断开`)
      }
      reply.raw.on('close', close)
      reply.raw.on('error', close)

      await new Promise<void>(() => {})
    })
  }
}

function writeEvent(res: ServerResponse, event: StoreEvent): void {
  res.write(`event: ${event.type}\n`)
  res.write(`data: ${JSON.stringify(event)}\n\n`)
}
