import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/shared/database/index.js'
import {
  customizationItems,
  customizationOptions,
  customizationOptionStoreStatus,
} from '@/shared/database/schema.js'
import { CustomizationItem, CustomizationOption } from '@/model/customization.js'
import {
  customizationItemStatusCode,
  customizationOptionGlobalStatusCode,
  customizationOptionStoreStatusCode,
  type CustomizationItemStatusCode,
  type CustomizationOptionGlobalStatusCode,
} from '@dextea/constraints'

export class CustomizationRepository {
  async findActiveItemsByProductId(productId: number): Promise<CustomizationItem[]> {
    const rows = await db
      .select()
      .from(customizationItems)
      .where(
        and(
          eq(customizationItems.productId, productId),
          eq(customizationItems.status, customizationItemStatusCode.ITEM_ACTIVE),
        ),
      )
      .orderBy(customizationItems.sort, customizationItems.id)

    return rows.map((row) => this.toItemModel(row))
  }

  async findActiveOptionsByItemIds(itemIds: number[]): Promise<CustomizationOption[]> {
    if (itemIds.length === 0) {
      return []
    }

    const rows = await db
      .select()
      .from(customizationOptions)
      .where(
        and(
          inArray(customizationOptions.itemId, itemIds),
          eq(customizationOptions.status, customizationOptionGlobalStatusCode.GLOBAL_ACTIVE),
        ),
      )
      .orderBy(customizationOptions.sort, customizationOptions.id)

    return rows.map((row) => this.toOptionModel(row))
  }

  async findOptionStoreStatusByStoreId(
    storeId: number,
    optionIds: number[],
  ): Promise<Map<number, number>> {
    const result = new Map<number, number>()
    for (const optionId of optionIds) {
      result.set(optionId, customizationOptionStoreStatusCode.STORE_DISABLED)
    }

    if (optionIds.length === 0) {
      return result
    }

    const rows = await db
      .select()
      .from(customizationOptionStoreStatus)
      .where(
        and(
          eq(customizationOptionStoreStatus.storeId, storeId),
          inArray(customizationOptionStoreStatus.optionId, optionIds),
        ),
      )

    for (const row of rows) {
      result.set(Number(row.optionId), Number(row.status))
    }

    return result
  }

  private toItemModel(row: typeof customizationItems.$inferSelect): CustomizationItem {
    return new CustomizationItem(
      Number(row.id),
      Number(row.productId),
      row.name,
      Number(row.sort),
      row.status as CustomizationItemStatusCode,
      row.createdAt,
      row.updatedAt,
    )
  }

  private toOptionModel(row: typeof customizationOptions.$inferSelect): CustomizationOption {
    return new CustomizationOption(
      Number(row.id),
      Number(row.itemId),
      row.name,
      Number(row.price),
      Number(row.sort),
      row.status as CustomizationOptionGlobalStatusCode,
      row.createdAt,
      row.updatedAt,
    )
  }
}

export const customizationRepository = new CustomizationRepository()
