import type { FastifyPluginAsync } from 'fastify'
import { getConfig } from '@/config/index.js'
import { getLogger } from '@/shared/logger.js'
import type { ScreenEvent, ScreenSimulator } from './screen.service.js'

export interface ScreenModuleOptions {
  screenSimulator: ScreenSimulator
}

/**
 * 服务大屏 SSE 通道：GET /events
 * 事件类型：snapshot（重连时全量）/ making / ready / collected
 */
export function createScreenRoutes(options: ScreenModuleOptions): FastifyPluginAsync {
  const { screenSimulator } = options

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
      writeEvent(reply.raw, screenSimulator.currentSnapshot())

      const send = (event: ScreenEvent) => writeEvent(reply.raw, event)
      const unsubscribe = screenSimulator.subscribe(send)

      const heartbeat = setInterval(() => {
        reply.raw.write(`: ping\n\n`)
      }, 15_000)

      requestLog(log, '大屏客户端已接入')
      const close = () => {
        clearInterval(heartbeat)
        unsubscribe()
        requestLog(log, '大屏客户端已断开')
      }
      reply.raw.on('close', close)
      reply.raw.on('error', close)

      // 挂起请求直到连接关闭，避免 Fastify 走默认 JSON 响应
      await new Promise<void>(() => {})
    })
  }
}

function writeEvent(res: import('node:http').ServerResponse, event: ScreenEvent): void {
  res.write(`event: ${event.type}\n`)
  res.write(`data: ${JSON.stringify(event)}\n\n`)
}

function requestLog(log: ReturnType<typeof getLogger>, message: string): void {
  log.info(`[screen] ${message}`)
}
