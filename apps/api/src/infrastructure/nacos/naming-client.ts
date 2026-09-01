import { NacosNamingClient } from 'nacos'
import { getConfig } from '@/config/index.js'
import { getLogger, type Logger } from '@/shared/logger.js'

export class NacosDiscoveryError extends Error {
  public constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'NacosDiscoveryError'
  }
}

interface NamingClient extends NacosNamingClient {
  on(event: 'error', listener: (error: Error) => void): unknown
  close: () => Promise<void>
}

interface ErrorEmitter {
  on(event: 'error', listener: (error: Error) => void): unknown
}

interface NamingClientInternals {
  _hostReactor?: ErrorEmitter & { _pushReceiver?: ErrorEmitter }
}

let client: NamingClient | undefined
let starting: Promise<NamingClient> | undefined

export function isNacosDiscoveryEnabled(): boolean {
  return getConfig().nacos.enabled
}

export async function getNacosNamingClient(): Promise<NacosNamingClient> {
  if (client) {
    return client
  }

  if (!starting) {
    starting = startNamingClient()
  }

  return starting
}

export async function closeNacosNamingClient(): Promise<void> {
  const current = client
  client = undefined
  starting = undefined

  if (!current) {
    return
  }

  try {
    await current.close()
    getLogger().info('[nacos] 命名客户端已关闭')
  } catch (error) {
    getLogger().warn({ error }, '[nacos] 关闭命名客户端失败')
  }
}

async function startNamingClient(): Promise<NamingClient> {
  try {
    const created = await createNamingClient()
    client = created
    return created
  } finally {
    starting = undefined
  }
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new NacosDiscoveryError(`等待超时（${milliseconds}ms）`)),
      milliseconds
    )
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

function forwardInternalErrors(instance: NacosNamingClient, logger: Logger): void {
  const { _hostReactor: hostReactor } = instance as unknown as NamingClientInternals

  hostReactor?._pushReceiver?.on('error', (error) => {
    logger.error({ error }, '[nacos] 服务实例变更推送接收失败')
  })

  hostReactor?.on('error', (error) => {
    logger.error({ error }, '[nacos] 服务实例列表更新失败')
  })
}

async function createNamingClient(): Promise<NamingClient> {
  const config = getConfig().nacos
  const logger = getLogger()

  if (config.serverList.length === 0) {
    throw new NacosDiscoveryError('NACOS_SERVER_ADDR 为空，无法创建 Nacos 命名客户端')
  }

  logger.info(
    { serverList: config.serverList, namespace: config.namespace, group: config.group },
    '[nacos] 正在连接服务注册中心'
  )

  const instance = new NacosNamingClient({
    logger: logger as unknown as typeof console,
    serverList: config.serverList,
    namespace: config.namespace,
    ...(config.username ? { username: config.username } : {}),
    ...(config.password ? { password: config.password } : {}),
  }) as NamingClient

  instance.on('error', (error) => {
    logger.error({ error }, '[nacos] 命名客户端内部错误')
  })

  forwardInternalErrors(instance, logger)

  try {
    // nacos SDK 的 ready() 在连不上注册中心时会无限重试，这里加超时避免阻塞调用方
    await withTimeout(instance.ready(), 5_000)
  } catch (error) {
    void instance.close().catch(() => undefined)
    throw new NacosDiscoveryError(
      `连接 Nacos 服务注册中心失败: ${config.serverList.join(',')}`,
      { cause: error }
    )
  }

  logger.info('[nacos] 命名客户端已就绪')

  return instance
}
