import {
  toCustomizationItemView,
  toCustomizationOptionView,
  type CustomizationItemView,
  type CustomizationOptionView,
} from '@/mapper/customization-mapper.js'
import { customizationRepository } from '@/repository/customization-repository.js'
import { BizError } from '@/shared/errors/biz-error.js'
import { CustomizationErrorCode } from '@/error/customization-error.js'
import type { CustomizationOptionStoreStatusCode } from '@dextea/constraints'

export class CustomizationService {
  async listByProductAndStore(productId: number, storeId: number): Promise<CustomizationItemView[]> {
    const items = await customizationRepository.findActiveItemsByProductId(productId)
    if (items.length === 0) {
      return []
    }

    const options = await customizationRepository.findActiveOptionsByItemIds(
      items.map((item) => item.id),
    )

    const storeStatusMap = await customizationRepository.findOptionStoreStatusByStoreId(
      storeId,
      options.map((option) => option.id),
    )

    const optionsByItemId = new Map<number, CustomizationOptionView[]>()
    for (const option of options) {
      const view = toCustomizationOptionView(
        option,
        storeStatusMap.get(option.id) as CustomizationOptionStoreStatusCode,
      )
      const list = optionsByItemId.get(option.itemId)
      if (list) {
        list.push(view)
      } else {
        optionsByItemId.set(option.itemId, [view])
      }
    }

    return items.map((item) => toCustomizationItemView(item, optionsByItemId.get(item.id) ?? []))
  }

  async updateOptionStoreStatus(
    optionId: number,
    storeId: number,
    status: CustomizationOptionStoreStatusCode,
  ): Promise<CustomizationOptionStoreStatusCode> {
    const option = await customizationRepository.findOptionById(optionId)
    if (!option) {
      throw new BizError(CustomizationErrorCode.OPTION_NOT_FOUND)
    }

    // 门店状态表懒加载：无记录即禁用，首次写入插入，后续更新
    await customizationRepository.upsertOptionStoreStatus(optionId, storeId, status)
    return status
  }
}

export const customizationService = new CustomizationService()
