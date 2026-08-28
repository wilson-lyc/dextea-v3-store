import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, unique, serial, varchar, text, timestamp, bigint, tinyint, index, decimal, double, int } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const customizationItems = mysqlTable("customization_items", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 32 }).notNull(),
	sort: tinyint().notNull(),
	status: tinyint().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_customization_items_product_id").on(table.productId),
	primaryKey({ columns: [table.id], name: "customization_items_id"}),
]);

export const customizationOptionStoreStatus = mysqlTable("customization_option_store_status", {
	optionId: bigint("option_id", { mode: "number", unsigned: true }).notNull(),
	storeId: bigint("store_id", { mode: "number", unsigned: true }).notNull(),
	status: tinyint().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.optionId, table.storeId], name: "customization_option_store_status_option_id_store_id"}),
]);

export const customizationOptions = mysqlTable("customization_options", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	itemId: bigint("item_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 32 }).notNull(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	sort: tinyint().notNull(),
	status: tinyint().notNull(),
	ingredientId: bigint("ingredient_id", { mode: "number", unsigned: true }),
	ingredientQuantity: double("ingredient_quantity"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_customization_options_item_id").on(table.itemId),
	primaryKey({ columns: [table.id], name: "customization_options_id"}),
]);
