import { Enum } from './enum.js'

const employeeStatusDef = [
  [0, 'DISABLED', '禁用'],
  [1, 'ACTIVE', '激活'],
] as const
export const EmployeeStatus = new Enum('EmployeeStatus', employeeStatusDef)
export type EmployeeStatusCode = (typeof employeeStatusDef)[number][0]

const storeStatusDef = [
  [0, 'CLOSED', '休息中'],
  [1, 'OPEN', '营业中'],
  [2, 'PENDING', '筹备中'],
  [3, 'DEFUNCT', '已注销'],
] as const
export const StoreStatus = new Enum('StoreStatus', storeStatusDef)
export type StoreStatusCode = (typeof storeStatusDef)[number][0]

const productGlobalStatusDef = [
  [0, 'GLOBAL_DISABLED', '全局下架'],
  [1, 'GLOBAL_ACTIVE', '全局上架'],
] as const
export const ProductGlobalStatus = new Enum('ProductGlobalStatus', productGlobalStatusDef)
export type ProductGlobalStatusCode = (typeof productGlobalStatusDef)[number][0]

const productStoreStatusDef = [
  [0, 'STORE_DISABLED', '门店售罄'],
  [1, 'STORE_ACTIVE', '门店可售'],
] as const
export const ProductStoreStatus = new Enum('ProductStoreStatus', productStoreStatusDef)
export type ProductStoreStatusCode = (typeof productStoreStatusDef)[number][0]

const customizationItemStatusDef = [
  [0, 'DISABLED', '禁用'],
  [1, 'ACTIVE', '激活'],
] as const
export const CustomizationItemStatus = new Enum('CustomizationItemStatus', customizationItemStatusDef)
export type CustomizationItemStatusCode = (typeof customizationItemStatusDef)[number][0]

const customizationOptionGlobalStatusDef = [
  [0, 'GLOBAL_DISABLED', '全局禁用'],
  [1, 'GLOBAL_ACTIVE', '全局激活'],
] as const
export const CustomizationOptionGlobalStatus = new Enum('CustomizationOptionGlobalStatus', customizationOptionGlobalStatusDef)
export type CustomizationOptionGlobalStatusCode = (typeof customizationOptionGlobalStatusDef)[number][0]

const customizationOptionStoreStatusDef = [
  [0, 'STORE_DISABLED', '门店禁用'],
  [1, 'STORE_ACTIVE', '门店激活'],
] as const
export const CustomizationOptionStoreStatus = new Enum('CustomizationOptionStoreStatus', customizationOptionStoreStatusDef)
export type CustomizationOptionStoreStatusCode = (typeof customizationOptionStoreStatusDef)[number][0]

const ingredientStatusDef = [
  [0, 'ACTIVE', '禁用'],
  [1, 'DISABLED', '激活'],
] as const
export const IngredientStatus = new Enum('IngredientStatus', ingredientStatusDef)
export type IngredientStatusCode = (typeof ingredientStatusDef)[number][0]

const customerStatusDef = [
  [0, 'ACTIVE', '禁用'],
  [1, 'DISABLED', '激活'],
] as const
export const CustomerStatus = new Enum('CustomerStatus', customerStatusDef)
export type CustomerStatusCode = (typeof customerStatusDef)[number][0]

const orderPaymentStatusDef = [
  [0, 'PENDING', '支付中'],
  [1, 'PAID', '已支付'],
  [2, 'REFUNDING', '退款中'],
  [3, 'REFUNDED', '已退款'],
] as const
export const OrderPaymentStatus = new Enum('OrderPaymentStatus', orderPaymentStatusDef)
export type OrderPaymentStatusCode = (typeof orderPaymentStatusDef)[number][0]

const orderPaymentMethodDef = [
  [0, 'ALIPAY', '支付宝'],
  [1, 'WEIXIN', '微信'],
] as const
export const OrderPaymentMethod = new Enum('OrderPaymentMethod', orderPaymentMethodDef)
export type OrderPaymentMethodCode = (typeof orderPaymentMethodDef)[number][0]

const orderMakingStatusDef = [
  [0, 'PENDING', '待制作'],
  [1, 'PREPARING', '制作中'],
  [2, 'READY', '制作完成'],
  [3, 'COLLECTED', '已取餐'],
] as const
export const OrderMakingStatus = new Enum('OrderMakingStatus', orderMakingStatusDef)
export type OrderMakingStatusCode = (typeof orderMakingStatusDef)[number][0]

const orderSourceDef = [
  [0, 'OFFLINE', '线下点餐'],
  [1, 'ALIPAY', '支付宝'],
  [2, 'WEIXIN', '微信'],
] as const
export const OrderSource = new Enum('OrderSource', orderSourceDef)
export type OrderSourceCode = (typeof orderSourceDef)[number][0]
