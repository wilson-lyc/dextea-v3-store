import { resolve as resolvePath, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolvePath(__dirname, '../.env') });

interface Config {
  port: number;
  host: string;
  corsOrigin: string;
  corsCredentials: boolean;
  nodeEnv: string;
  logLevel: string;

  db: {
    host?: string;
    port: number;
    user?: string;
    password?: string;
    name?: string;
  };

  redis: {
    host?: string;
    port: number;
    password?: string;
    db: number;
  };

  jwt: {
    secret: string;
    expiresIn: string;
  };
}

function buildConfig(): Config {
  const env = process.env;

  const rawDb = env.REDIS_DB?.trim();
  const redisDb = rawDb === undefined || rawDb === '' ? 0 : Number(rawDb);

  return {
    port: Number(env.PORT) || 8296,
    host: env.HOST || '127.0.0.1',
    corsOrigin: env.CORS_ORIGIN || 'http://localhost:8195',
    corsCredentials: env.CORS_CREDENTIALS !== 'false',
    nodeEnv: env.NODE_ENV || 'development',
    logLevel: env.LOG_LEVEL || 'info',

    db: {
      host: env.DB_HOST,
      port: Number(env.DB_PORT),
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      name: env.DB_NAME,
    },

    redis: {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
      password: env.REDIS_PASSWORD,
      db: redisDb,
    },

    jwt: {
      secret: env.JWT_SECRET || '',
      expiresIn: env.JWT_EXPIRES_IN || '7d',
    },
  };
}

function validateConfig(config: Config): void {
  const missing: string[] = [];

  if (!config.db.host) missing.push('DB_HOST');
  if (!config.db.port || !Number.isFinite(config.db.port) || config.db.port <= 0) missing.push('DB_PORT');
  if (!config.db.user) missing.push('DB_USER');
  if (!config.db.name) missing.push('DB_NAME');

  if (!config.redis.host) missing.push('REDIS_HOST');
  if (!config.redis.port || !Number.isFinite(config.redis.port) || config.redis.port <= 0) missing.push('REDIS_PORT');

  if (!config.jwt.secret) missing.push('JWT_SECRET');

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please provide them in your .env file before starting the server.',
    );
    process.exit(1);
  }
}

export const config = buildConfig();
validateConfig(config);
