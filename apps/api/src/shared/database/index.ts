import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { config } from '@/config.js'

const { host, port, name: database, user, password } = config.db

const pool = mysql.createPool({
  host,
  port,
  database,
  user,
  password,
})

export const db = drizzle(pool)
export type Database = typeof db
export { pool }
export * from './schema.js'
