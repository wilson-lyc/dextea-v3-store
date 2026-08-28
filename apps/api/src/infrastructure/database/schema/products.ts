import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, unique, serial, varchar, text, timestamp, bigint, tinyint, index, decimal, double, int } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const productStoreStatus = mysqlTable("product_store_status", {
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	storeId: bigint("store_id", { mode: "number", unsigned: true }).notNull(),
	status: tinyint().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.productId, table.storeId], name: "product_store_status_product_id_store_id"}),
]);

export const products = mysqlTable("products", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	name: varchar({ length: 64 }).notNull(),
	brief: varchar({ length: 64 }).notNull(),
	description: varchar({ length: 500 }).notNull(),
	status: tinyint().notNull(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "products_id"}),
]);
