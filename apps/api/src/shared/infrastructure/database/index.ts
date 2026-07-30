import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = mysql.createPool(connectionString)

export const db = drizzle(pool)
export { pool }
