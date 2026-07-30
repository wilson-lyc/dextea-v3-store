import { codeMap } from './enum.js'

export const EmployeeStatus = [
  { code: 0, key: 'DISABLED', label: '禁用' },
  { code: 1, key: 'ACTIVE', label: '激活' },
] as const
export type EmployeeStatusCode = (typeof EmployeeStatus)[number]['code']
export const employeeStatusCode = codeMap(EmployeeStatus)

export const StoreStatus = [
  { code: 0, key: 'CLOSED', label: '休息中' },
  { code: 1, key: 'OPEN', label: '营业中' },
  { code: 2, key: 'PENDING', label: '筹备中' },
  { code: 3, key: 'DEFUNCT', label: '已注销' },
] as const
export type StoreStatusCode = (typeof StoreStatus)[number]['code']
export const storeStatusCode = codeMap(StoreStatus)

export const ProductGlobalStatus = [
  { code: 0, key: 'GLOBAL_DISABLED', label: '全局下架' },
  { code: 1, key: 'GLOBAL_ACTIVE', label: '全局上架' },
] as const
export type ProductGlobalStatusCode = (typeof ProductGlobalStatus)[number]['code']
export const productGlobalStatusCode = codeMap(ProductGlobalStatus)

export const ProductStoreStatus = [
  { code: 0, key: 'STORE_DISABLED', label: '门店售罄' },
  { code: 1, key: 'STORE_ACTIVE', label: '门店可售' },
] as const
export type ProductStoreStatusCode = (typeof ProductStoreStatus)[number]['code']
export const productStoreStatusCode = codeMap(ProductStoreStatus)

export const CustomizationItemStatus = [
  { code: 0, key: 'DISABLED', label: '禁用' },
  { code: 1, key: 'ACTIVE', label: '激活' },
] as const
export type CustomizationItemStatusCode = (typeof CustomizationItemStatus)[number]['code']
export const customizationItemStatusCode = codeMap(CustomizationItemStatus)

export const CustomizationOptionGlobalStatus = [
  { code: 0, key: 'GLOBAL_DISABLED', label: '全局禁用' },
  { code: 1, key: 'GLOBAL_ACTIVE', label: '全局激活' },
] as const
export type CustomizationOptionGlobalStatusCode = (typeof CustomizationOptionGlobalStatus)[number]['code']
export const customizationOptionGlobalStatusCode = codeMap(CustomizationOptionGlobalStatus)

export const CustomizationOptionStoreStatus = [
  { code: 0, key: 'STORE_DISABLED', label: '门店禁用' },
  { code: 1, key: 'STORE_ACTIVE', label: '门店激活' },
] as const
export type CustomizationOptionStoreStatusCode = (typeof CustomizationOptionStoreStatus)[number]['code']
export const customizationOptionStoreStatusCode = codeMap(CustomizationOptionStoreStatus)

export const IngredientStatus = [
  { code: 0, key: 'ACTIVE', label: '禁用' },
  { code: 1, key: 'DISABLED', label: '激活' },
] as const
export type IngredientStatusCode = (typeof IngredientStatus)[number]['code']
export const ingredientStatusCode = codeMap(IngredientStatus)

export const CustomerStatus = [
  { code: 0, key: 'ACTIVE', label: '禁用' },
  { code: 1, key: 'DISABLED', label: '激活' },
] as const
export type CustomerStatusCode = (typeof CustomerStatus)[number]['code']
export const customerStatusCode = codeMap(CustomerStatus)

export const OrderPaymentStatus = [
  { code: 0, key: 'PENDING', label: '支付中' },
  { code: 1, key: 'PAID', label: '已支付' },
  { code: 2, key: 'REFUNDING', label: '退款中' },
  { code: 3, key: 'REFUNDED', label: '已退款' },
] as const
export type OrderPaymentStatusCode = (typeof OrderPaymentStatus)[number]['code']
export const orderPaymentStatusCode = codeMap(OrderPaymentStatus)

export const OrderPaymentMethod = [
  { code: 0, key: 'CASH', label: '现金' },
  { code: 1, key: 'ALIPAY', label: '支付宝' },
  { code: 2, key: 'WEIXIN', label: '微信' },
] as const
export type OrderPaymentMethodCode = (typeof OrderPaymentMethod)[number]['code']
export const orderPaymentMethodCode = codeMap(OrderPaymentMethod)

export const OrderMakingStatus = [
  { code: 0, key: 'PENDING', label: '待制作' },
  { code: 1, key: 'PREPARING', label: '制作中' },
  { code: 2, key: 'READY', label: '制作完成' },
  { code: 3, key: 'COLLECTED', label: '已取餐' },
] as const
export type OrderMakingStatusCode = (typeof OrderMakingStatus)[number]['code']
export const orderMakingStatusCode = codeMap(OrderMakingStatus)

export const OrderSource = [
  { code: 0, key: 'OFFLINE', label: '线下点餐' },
  { code: 1, key: 'ALIPAY', label: '支付宝' },
  { code: 2, key: 'WEIXIN', label: '微信' },
] as const
export type OrderSourceCode = (typeof OrderSource)[number]['code']
export const orderSourceCode = codeMap(OrderSource)
