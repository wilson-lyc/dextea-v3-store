import type {
  CustomizationItemStatusCode,
  CustomizationOptionGlobalStatusCode,
  CustomizationOptionStoreStatusCode,
} from '@dextea/constraints'
import type { CustomizationItem, CustomizationOption } from '@/model/customization.js'

export interface CustomizationOptionView {
  id: number
  itemId: number
  name: string
  price: number
  sort: number
  status: CustomizationOptionGlobalStatusCode
  storeStatus: CustomizationOptionStoreStatusCode
  createdAt: string
  updatedAt: string
}

export interface CustomizationItemView {
  id: number
  productId: number
  name: string
  sort: number
  status: CustomizationItemStatusCode
  options: CustomizationOptionView[]
  createdAt: string
  updatedAt: string
}

export function toCustomizationOptionView(
  option: CustomizationOption,
  storeStatus: CustomizationOptionStoreStatusCode,
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
  options: CustomizationOptionView[],
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
