import { and, eq, inArray } from 'drizzle-orm'
import {
  CustomizationItemStatus,
  CustomizationOptionGlobalStatus,
  CustomizationOptionStoreStatus,
  customizationItemStatusCode,
  customizationOptionGlobalStatusCode,
  customizationOptionStoreStatusCode,
  type CustomizationItemStatusCode,
  type CustomizationOptionGlobalStatusCode,
  type CustomizationOptionStoreStatusCode,
} from '@dextea/constraints'
import type { Database } from '@/infrastructure/database/pool.js'
import {
  customizationItems,
  customizationOptionStoreStatus,
  customizationOptions,
} from '@/infrastructure/database/schema.js'
import { buildStoreStatusMap } from '@/shared/store-status.js'
import { CustomizationItem, CustomizationOption } from './customization.model.js'

export interface CustomizationRepository {
  findActiveItemsByProductId(productId: number): Promise<CustomizationItem[]>
  findActiveOptionsByItemIds(itemIds: readonly number[]): Promise<CustomizationOption[]>
  findOptionStoreStatusByStoreId(
    storeId: number,
    optionIds: readonly number[]
  ): Promise<Map<number, CustomizationOptionStoreStatusCode>>
  findOptionById(optionId: number): Promise<CustomizationOption | null>
  upsertOptionStoreStatus(
    optionId: number,
    storeId: number,
    status: CustomizationOptionStoreStatusCode
  ): Promise<void>
}

export class DrizzleCustomizationRepository implements CustomizationRepository {
  public constructor(private readonly db: Database) {}

  public async findActiveItemsByProductId(
    productId: number
  ): Promise<CustomizationItem[]> {
    const rows = await this.db
      .select()
      .from(customizationItems)
      .where(
        and(
          eq(customizationItems.productId, productId),
          eq(customizationItems.status, customizationItemStatusCode.ITEM_ACTIVE)
        )
      )
      .orderBy(customizationItems.sort, customizationItems.id)

    return rows.map((row) => this.toItemModel(row))
  }

  public async findActiveOptionsByItemIds(
    itemIds: readonly number[]
  ): Promise<CustomizationOption[]> {
    if (itemIds.length === 0) {
      return []
    }

    const rows = await this.db
      .select()
      .from(customizationOptions)
      .where(
        and(
          inArray(customizationOptions.itemId, [...itemIds]),
          eq(
            customizationOptions.status,
            customizationOptionGlobalStatusCode.GLOBAL_ACTIVE
          )
        )
      )
      .orderBy(customizationOptions.sort, customizationOptions.id)

    return rows.map((row) => this.toOptionModel(row))
  }

  public async findOptionStoreStatusByStoreId(
    storeId: number,
    optionIds: readonly number[]
  ): Promise<Map<number, CustomizationOptionStoreStatusCode>> {
    if (optionIds.length === 0) {
      return new Map()
    }

    const rows = await this.db
      .select()
      .from(customizationOptionStoreStatus)
      .where(
        and(
          eq(customizationOptionStoreStatus.storeId, storeId),
          inArray(customizationOptionStoreStatus.optionId, [...optionIds])
        )
      )

    return buildStoreStatusMap<CustomizationOptionStoreStatusCode>(
      optionIds,
      customizationOptionStoreStatusCode.STORE_DISABLED,
      rows.map((row) => [Number(row.optionId), row.status] as const),
      (raw) => CustomizationOptionStoreStatus.schema().parse(raw)
    )
  }

  public async findOptionById(optionId: number): Promise<CustomizationOption | null> {
    const [row] = await this.db
      .select()
      .from(customizationOptions)
      .where(eq(customizationOptions.id, optionId))
      .limit(1)

    return row ? this.toOptionModel(row) : null
  }

  public async upsertOptionStoreStatus(
    optionId: number,
    storeId: number,
    status: CustomizationOptionStoreStatusCode
  ): Promise<void> {
    await this.db
      .insert(customizationOptionStoreStatus)
      .values({ optionId, storeId, status })
      .onDuplicateKeyUpdate({ set: { status } })
  }

  private toItemModel(row: typeof customizationItems.$inferSelect): CustomizationItem {
    return new CustomizationItem(
      row.id,
      row.productId,
      row.name,
      row.sort,
      CustomizationItemStatus.schema().parse(row.status) as CustomizationItemStatusCode,
      row.createdAt,
      row.updatedAt
    )
  }

  private toOptionModel(
    row: typeof customizationOptions.$inferSelect
  ): CustomizationOption {
    return new CustomizationOption(
      row.id,
      row.itemId,
      row.name,
      Number(row.price),
      row.sort,
      CustomizationOptionGlobalStatus.schema().parse(
        row.status
      ) as CustomizationOptionGlobalStatusCode,
      row.createdAt,
      row.updatedAt
    )
  }
}
