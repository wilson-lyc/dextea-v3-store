import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, unique, serial, varchar, text, timestamp, bigint, tinyint, index, decimal, double, int } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const stores = mysqlTable("stores", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	province: varchar({ length: 50 }).notNull(),
	city: varchar({ length: 50 }).notNull(),
	district: varchar({ length: 50 }).notNull(),
	address: varchar({ length: 500 }).notNull(),
	status: tinyint().notNull(),
	businessHours: varchar("business_hours", { length: 255 }).notNull(),
	phone: varchar({ length: 50 }).notNull(),
	longitude: double().notNull(),
	latitude: double().notNull(),
	account: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "stores_id"}),
	unique("uq_stores_account").on(table.account),
]);
