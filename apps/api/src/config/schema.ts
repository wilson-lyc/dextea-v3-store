import { z } from 'zod'

function booleanFromEnv(defaultValue: 'true' | 'false' = 'false') {
  return z
    .enum(['true', 'false'])
    .default(defaultValue)
    .transform((value) => value === 'true')
}

const mqEnvSchema = z.object({
  ORDER_MAKING_MQ_ENABLED: booleanFromEnv(),
  ORDER_MAKING_MQ_ENDPOINTS: z.string().default(''),
  ORDER_MAKING_MQ_NAMESPACE: z.string().default(''),
  ORDER_MAKING_MQ_ACCESS_KEY: z.string().default(''),
  ORDER_MAKING_MQ_SECRET_KEY: z.string().default(''),
  ORDER_MAKING_MQ_TOPIC: z.string().default(''),
  ORDER_MAKING_MQ_CONSUMER_GROUP: z.string().default(''),
})

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(8296),
    HOST: z.string().min(1).default('127.0.0.1'),
    CORS_ORIGIN: z.string().min(1).default('http://localhost:8195'),
    CORS_CREDENTIALS: booleanFromEnv('true'),
    LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
      .default('info'),

    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive(),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().min(1),

    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().min(1).default('7d'),

    ORDER_SERVICE_BASE_URL: z.url(),

    ...mqEnvSchema.shape,
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && env.JWT_SECRET.length < 16) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT_SECRET'],
        message: '生产环境下 JWT_SECRET 至少需要 16 个字符',
      })
    }
  })

export type Env = z.infer<typeof envSchema>
