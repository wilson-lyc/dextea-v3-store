import { resolve as resolvePath, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { envSchema, type Env } from './schema.js'

const currentDirectory = dirname(fileURLToPath(import.meta.url))

if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: resolvePath(currentDirectory, '../../.env') })
}

export interface NacosConfig {
  enabled: boolean
  serverList: string[]
  namespace: string
  group: string
  clusters: string
  username: string | undefined
  password: string | undefined
}

export interface OrderServiceConfig {
  serviceName: string
  scheme: 'http' | 'https'
  baseUrl: string | undefined
}

export interface MqConfig {
  enabled: boolean
  endpoints: string
  namespace: string
  accessKey: string
  secretKey: string
  topic: string
  consumerGroup: string
  /** 消费过滤 Tag，仅 screen MQ 使用 */
  tag?: string
}

export interface AppConfig {
  nodeEnv: Env['NODE_ENV']
  server: {
    port: number
    host: string
    cors: {
      origin: string
      credentials: boolean
    }
  }
  log: {
    level: Env['LOG_LEVEL']
  }
  db: {
    host: string
    port: number
    user: string
    password: string | undefined
    name: string
  }
  jwt: {
    secret: string
    expiresIn: string
  }
  orderService: OrderServiceConfig
  nacos: NacosConfig
  mq: {
    orderMaking: MqConfig
    screenReady: MqConfig
  }
}

export class ConfigurationError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

function splitServerList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '')
}

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `- ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    throw new ConfigurationError(`环境变量校验失败:\n${details}`)
  }

  return result.data
}

function buildConfig(env: Env): AppConfig {
  return {
    nodeEnv: env.NODE_ENV,
    server: {
      port: env.PORT,
      host: env.HOST,
      cors: {
        origin: env.CORS_ORIGIN,
        credentials: env.CORS_CREDENTIALS,
      },
    },
    log: {
      level: env.LOG_LEVEL,
    },
    db: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      name: env.DB_NAME,
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    },
    orderService: {
      serviceName: env.ORDER_SERVICE_NAME.trim(),
      scheme: env.ORDER_SERVICE_SCHEME,
      baseUrl: env.ORDER_SERVICE_BASE_URL?.replace(/\/+$/, ''),
    },
    nacos: {
      enabled: env.NACOS_ENABLED,
      serverList: splitServerList(env.NACOS_SERVER_ADDR),
      namespace: env.NACOS_NAMESPACE.trim() || 'public',
      group: env.NACOS_GROUP.trim() || 'DEFAULT_GROUP',
      clusters: env.NACOS_CLUSTERS.trim(),
      username: env.NACOS_USERNAME.trim() || undefined,
      password: env.NACOS_PASSWORD.trim() || undefined,
    },
    mq: {
      orderMaking: {
        enabled: env.ORDER_MAKING_MQ_ENABLED,
        endpoints: env.ORDER_MAKING_MQ_ENDPOINTS,
        namespace: env.ORDER_MAKING_MQ_NAMESPACE,
        accessKey: env.ORDER_MAKING_MQ_ACCESS_KEY,
        secretKey: env.ORDER_MAKING_MQ_SECRET_KEY,
        topic: env.ORDER_MAKING_MQ_TOPIC,
        consumerGroup: env.ORDER_MAKING_MQ_CONSUMER_GROUP,
      },
      screenReady: {
        enabled: env.SCREEN_READY_MQ_ENABLED,
        endpoints: env.SCREEN_READY_MQ_ENDPOINTS,
        namespace: env.SCREEN_READY_MQ_NAMESPACE,
        accessKey: env.SCREEN_READY_MQ_ACCESS_KEY,
        secretKey: env.SCREEN_READY_MQ_SECRET_KEY,
        topic: env.SCREEN_READY_MQ_TOPIC,
        consumerGroup: env.SCREEN_READY_MQ_CONSUMER_GROUP,
        tag: env.SCREEN_READY_MQ_TAG,
      },
    },
  }
}

let cachedConfig: AppConfig | undefined

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = buildConfig(parseEnv())
  }
  return cachedConfig
}

export function resetConfig(): void {
  cachedConfig = undefined
}
