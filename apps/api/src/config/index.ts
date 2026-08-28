import { resolve as resolvePath, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { envSchema, type Env } from './schema.js'

const currentDirectory = dirname(fileURLToPath(import.meta.url))

if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: resolvePath(currentDirectory, '../../.env') })
}

export interface MqConfig {
  enabled: boolean
  endpoints: string
  namespace: string
  accessKey: string
  secretKey: string
  topic: string
  consumerGroup: string
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
  orderService: {
    baseUrl: string
  }
  mq: {
    orderMaking: MqConfig
  }
}

export class ConfigurationError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
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
      baseUrl: env.ORDER_SERVICE_BASE_URL,
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
