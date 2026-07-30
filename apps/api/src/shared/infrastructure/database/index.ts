import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { config } from '@/shared/config.js'

const { host, port, database, user, password } = config.database

const pool = mysql.createPool({
  host,
  port,
  database,
  user,
  password,
})

export const db = drizzle(pool)
export { pool }
