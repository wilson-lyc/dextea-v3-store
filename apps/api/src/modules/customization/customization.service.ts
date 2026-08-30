import {
  customizationOptionStoreStatusCode,
  type CustomizationOptionStoreStatusCode,
} from '@dextea/constraints'
import { BizError } from '@/shared/errors.js'
import { getLogger } from '@/shared/logger.js'
import { customizationErrors } from './customization.error.js'
import type { CustomizationItem, CustomizationOption } from './customization.model.js'
import type { CustomizationRepository } from './customization.repository.js'

export interface CustomizationOptionWithStoreStatus {
  option: CustomizationOption
  storeStatus: CustomizationOptionStoreStatusCode
}

export interface CustomizationItemWithOptions {
  item: CustomizationItem
  options: CustomizationOptionWithStoreStatus[]
}

export class CustomizationService {
  private readonly logger = getLogger()

  public constructor(private readonly customizationRepository: CustomizationRepository) {}

  public async listByProductAndStore(
    productId: number,
    storeId: number
  ): Promise<CustomizationItemWithOptions[]> {
    const items = await this.customizationRepository.findActiveItemsByProductId(productId)

    if (items.length === 0) {
      return []
    }

    const options = await this.customizationRepository.findActiveOptionsByItemIds(
      items.map((item) => item.id)
    )

    const storeStatusMap =
      await this.customizationRepository.findOptionStoreStatusByStoreId(
        storeId,
        options.map((option) => option.id)
      )

    const optionsByItemId = new Map<number, CustomizationOptionWithStoreStatus[]>()
    for (const option of options) {
      const entry: CustomizationOptionWithStoreStatus = {
        option,
        storeStatus:
          storeStatusMap.get(option.id) ??
          customizationOptionStoreStatusCode.STORE_DISABLED,
      }

      const list = optionsByItemId.get(option.itemId)
      if (list) {
        list.push(entry)
      } else {
        optionsByItemId.set(option.itemId, [entry])
      }
    }

    return items.map((item) => ({
      item,
      options: optionsByItemId.get(item.id) ?? [],
    }))
  }

  public async updateOptionStoreStatus(
    optionId: number,
    storeId: number,
    status: CustomizationOptionStoreStatusCode
  ): Promise<CustomizationOptionStoreStatusCode> {
    const option = await this.customizationRepository.findOptionById(optionId)

    if (!option) {
      throw new BizError(customizationErrors.OPTION_NOT_FOUND)
    }

    await this.customizationRepository.upsertOptionStoreStatus(optionId, storeId, status)

    this.logger.info(
      { optionId, storeId, status },
      '[customization] 客制化选项门店状态已更新'
    )

    return status
  }
}
