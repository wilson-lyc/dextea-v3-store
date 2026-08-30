import type {
  CustomizationItemView,
  CustomizationOptionStoreStatusCode,
  CustomizationOptionView,
} from '@dextea/constraints'
import type { CustomizationItem, CustomizationOption } from './customization.model.js'

export function toCustomizationOptionView(
  option: CustomizationOption,
  storeStatus: CustomizationOptionStoreStatusCode
): CustomizationOptionView {
  return {
    id: option.id,
    itemId: option.itemId,
    name: option.name,
    price: option.price,
    sort: option.sort,
    status: option.status,
    storeStatus,
    createdAt: option.createdAt,
    updatedAt: option.updatedAt,
  }
}

export function toCustomizationItemView(
  item: CustomizationItem,
  options: CustomizationOptionView[]
): CustomizationItemView {
  return {
    id: item.id,
    productId: item.productId,
    name: item.name,
    sort: item.sort,
    status: item.status,
    options,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}
