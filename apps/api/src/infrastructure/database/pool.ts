import mysql from 'mysql2/promise'
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2'
import { getConfig } from '@/config/index.js'
import { getLogger } from '@/shared/logger.js'
import * as schema from './schema.js'

export type Database = MySql2Database<typeof schema>

let pool: mysql.Pool | undefined
let database: Database | undefined

export function getDatabase(): Database {
  if (database) {
    return database
  }

  const { host, port, user, password, name } = getConfig().db

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database: name,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60_000,
    enableKeepAlive: true,
  })

  database = drizzle(pool, { schema, mode: 'default' })
  getLogger().info('[database] 连接池已创建')

  return database
}

export async function closeDatabase(): Promise<void> {
  if (!pool) {
    return
  }

  await pool.end()
  pool = undefined
  database = undefined
  getLogger().info('[database] 连接池已关闭')
}
