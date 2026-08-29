import { codeMap, createEnum, type EnumColor, type EnumItemConfig } from './enum.js'

export { createEnum } from './enum.js'
export type { EnumColor, EnumItemConfig, EnumInstance, EnumItem } from './enum.js'

export const StoreStatus = createEnum([
  {
    key: 'CLOSED',
    value: 0,
    label: '休息中',
    color: { text: '#6b7280', background: '#f3f4f6', border: '#e5e7eb' },
  },
  {
    key: 'OPEN',
    value: 1,
    label: '营业中',
    color: { text: '#16a34a', background: '#dcfce7', border: '#bbf7d0' },
  },
  {
    key: 'PENDING',
    value: 2,
    label: '筹备中',
    color: { text: '#d97706', background: '#fef3c7', border: '#fde68a' },
  },
  {
    key: 'DEFUNCT',
    value: 3,
    label: '已注销',
    color: { text: '#dc2626', background: '#fee2e2', border: '#fecaca' },
  },
])

export type StoreStatusKey = (typeof StoreStatus.items)[number]['key']
export type StoreStatusValue = (typeof StoreStatus.items)[number]['value']
export type StoreStatusCode = StoreStatusValue

export const ProductGlobalStatus = createEnum([
  {
    key: 'DISABLED',
    value: 0,
    label: '下架',
    color: { text: '#6b7280', background: '#f3f4f6', border: '#e5e7eb' },
  },
  {
    key: 'ACTIVE',
    value: 1,
    label: '上架',
    color: { text: '#16a34a', background: '#dcfce7', border: '#bbf7d0' },
  },
])

export type ProductGlobalStatusKey = (typeof ProductGlobalStatus.items)[number]['key']
export type ProductGlobalStatusValue = (typeof ProductGlobalStatus.items)[number]['value']

export const ProductStoreStatus = createEnum([
  {
    key: 'DISABLED',
    value: 0,
    label: '售罄',
    color: { text: '#dc2626', background: '#fee2e2', border: '#fecaca' },
  },
  {
    key: 'ACTIVE',
    value: 1,
    label: '可售',
    color: { text: '#16a34a', background: '#dcfce7', border: '#bbf7d0' },
  },
])

export type ProductStoreStatusKey = (typeof ProductStoreStatus.items)[number]['key']
export type ProductStoreStatusValue = (typeof ProductStoreStatus.items)[number]['value']

export const CustomizationItemStatus = createEnum([
  {
    key: 'DISABLED',
    value: 0,
    label: '禁用',
    color: { text: '#6b7280', background: '#f3f4f6', border: '#e5e7eb' },
  },
  {
    key: 'ACTIVE',
    value: 1,
    label: '激活',
    color: { text: '#16a34a', background: '#dcfce7', border: '#bbf7d0' },
  },
])

export type CustomizationItemStatusKey = (typeof CustomizationItemStatus.items)[number]['key']
export type CustomizationItemStatusValue = (typeof CustomizationItemStatus.items)[number]['value']

export const CustomizationOptionGlobalStatus = createEnum([
  {
    key: 'DISABLED',
    value: 0,
    label: '禁用',
    color: { text: '#6b7280', background: '#f3f4f6', border: '#e5e7eb' },
  },
  {
    key: 'ACTIVE',
    value: 1,
    label: '激活',
    color: { text: '#16a34a', background: '#dcfce7', border: '#bbf7d0' },
  },
])

export type CustomizationOptionGlobalStatusKey = (typeof CustomizationOptionGlobalStatus.items)[number]['key']
export type CustomizationOptionGlobalStatusValue = (typeof CustomizationOptionGlobalStatus.items)[number]['value']

export const CustomizationOptionStoreStatus = createEnum([
  {
    key: 'DISABLED',
    value: 0,
    label: '禁用',
    color: { text: '#6b7280', background: '#f3f4f6', border: '#e5e7eb' },
  },
  {
    key: 'ACTIVE',
    value: 1,
    label: '激活',
    color: { text: '#16a34a', background: '#dcfce7', border: '#bbf7d0' },
  },
])

export type CustomizationOptionStoreStatusKey = (typeof CustomizationOptionStoreStatus.items)[number]['key']
export type CustomizationOptionStoreStatusValue = (typeof CustomizationOptionStoreStatus.items)[number]['value']

export const OrderPaymentStatus = createEnum([
  {
    key: 'PENDING',
    value: 0,
    label: '支付中',
    color: { text: '#d97706', background: '#fef3c7', border: '#fde68a' },
  },
  {
    key: 'TIMEOUT',
    value: 1,
    label: '支付超时',
    color: { text: '#dc2626', background: '#fee2e2', border: '#fecaca' },
  },
  {
    key: 'PAID',
    value: 2,
    label: '已支付',
    color: { text: '#16a34a', background: '#dcfce7', border: '#bbf7d0' },
  },
  {
    key: 'REFUNDING',
    value: 3,
    label: '退款中',
    color: { text: '#d97706', background: '#fef3c7', border: '#fde68a' },
  },
  {
    key: 'REFUNDED',
    value: 4,
    label: '已退款',
    color: { text: '#6b7280', background: '#f3f4f6', border: '#e5e7eb' },
  },
])

export type OrderPaymentStatusKey = (typeof OrderPaymentStatus.items)[number]['key']
export type OrderPaymentStatusValue = (typeof OrderPaymentStatus.items)[number]['value']

export const OrderPaymentMethod = createEnum([
  {
    key: 'CASH',
    value: 0,
    label: '现金',
    color: { text: '#4b5563', background: '#f3f4f6', border: '#e5e7eb' },
  },
  {
    key: 'ALIPAY',
    value: 1,
    label: '支付宝',
    color: { text: '#1677ff', background: '#e6f4ff', border: '#bae0ff' },
  },
  {
    key: 'WEIXIN',
    value: 2,
    label: '微信',
    color: { text: '#16a34a', background: '#dcfce7', border: '#bbf7d0' },
  },
])

export type OrderPaymentMethodKey = (typeof OrderPaymentMethod.items)[number]['key']
export type OrderPaymentMethodValue = (typeof OrderPaymentMethod.items)[number]['value']

export const OrderMakingStatus = createEnum([
  {
    key: 'PENDING',
    value: 0,
    label: '待制作',
    color: { text: '#d97706', background: '#fef3c7', border: '#fde68a' },
  },
  {
    key: 'PREPARING',
    value: 1,
    label: '制作中',
    color: { text: '#1677ff', background: '#e6f4ff', border: '#bae0ff' },
  },
  {
    key: 'READY',
    value: 2,
    label: '制作完成',
    color: { text: '#16a34a', background: '#dcfce7', border: '#bbf7d0' },
  },
  {
    key: 'COLLECTED',
    value: 3,
    label: '已取餐',
    color: { text: '#6b7280', background: '#f3f4f6', border: '#e5e7eb' },
  },
])

export type OrderMakingStatusKey = (typeof OrderMakingStatus.items)[number]['key']
export type OrderMakingStatusValue = (typeof OrderMakingStatus.items)[number]['value']

export const OrderSource = createEnum([
  {
    key: 'OFFLINE',
    value: 0,
    label: '线下点餐',
    color: { text: '#4b5563', background: '#f3f4f6', border: '#e5e7eb' },
  },
  {
    key: 'ALIPAY',
    value: 1,
    label: '支付宝',
    color: { text: '#1677ff', background: '#e6f4ff', border: '#bae0ff' },
  },
  {
    key: 'WEIXIN',
    value: 2,
    label: '微信',
    color: { text: '#16a34a', background: '#dcfce7', border: '#bbf7d0' },
  },
])

export type OrderSourceKey = (typeof OrderSource.items)[number]['key']
export type OrderSourceValue = (typeof OrderSource.items)[number]['value']

export const OrderDiningMethod = createEnum([
  {
    key: 'DINE_IN',
    value: 1,
    label: '堂食',
    color: { text: '#16a34a', background: '#dcfce7', border: '#bbf7d0' },
  },
  {
    key: 'TAKEOUT',
    value: 2,
    label: '外带',
    color: { text: '#d97706', background: '#fef3c7', border: '#fde68a' },
  },
  {
    key: 'TAKEAWAY_DELIVERY',
    value: 3,
    label: '外卖',
    color: { text: '#1677ff', background: '#e6f4ff', border: '#bae0ff' },
  },
])

export type OrderDiningMethodKey = (typeof OrderDiningMethod.items)[number]['key']
export type OrderDiningMethodValue = (typeof OrderDiningMethod.items)[number]['value']

export const productGlobalStatusCode = codeMap([
  { key: 'GLOBAL_DISABLED', value: 0, label: '下架', color: { text: '', background: '', border: '' } },
  { key: 'GLOBAL_ACTIVE', value: 1, label: '上架', color: { text: '', background: '', border: '' } },
])

export type ProductGlobalStatusCode = (typeof productGlobalStatusCode)[keyof typeof productGlobalStatusCode]

export const productStoreStatusCode = codeMap([
  { key: 'STORE_DISABLED', value: 0, label: '禁用', color: { text: '', background: '', border: '' } },
  { key: 'STORE_ACTIVE', value: 1, label: '可售', color: { text: '', background: '', border: '' } },
])

export type ProductStoreStatusCode = (typeof productStoreStatusCode)[keyof typeof productStoreStatusCode]

export const customizationItemStatusCode = codeMap([
  { key: 'ITEM_DISABLED', value: 0, label: '禁用', color: { text: '', background: '', border: '' } },
  { key: 'ITEM_ACTIVE', value: 1, label: '激活', color: { text: '', background: '', border: '' } },
])

export type CustomizationItemStatusCode =
  (typeof customizationItemStatusCode)[keyof typeof customizationItemStatusCode]

export const customizationOptionGlobalStatusCode = codeMap([
  { key: 'GLOBAL_DISABLED', value: 0, label: '下架', color: { text: '', background: '', border: '' } },
  { key: 'GLOBAL_ACTIVE', value: 1, label: '上架', color: { text: '', background: '', border: '' } },
])

export type CustomizationOptionGlobalStatusCode =
  (typeof customizationOptionGlobalStatusCode)[keyof typeof customizationOptionGlobalStatusCode]

export const customizationOptionStoreStatusCode = codeMap([
  { key: 'STORE_DISABLED', value: 0, label: '禁用', color: { text: '', background: '', border: '' } },
  { key: 'STORE_ACTIVE', value: 1, label: '启用', color: { text: '', background: '', border: '' } },
])

export type CustomizationOptionStoreStatusCode =
  (typeof customizationOptionStoreStatusCode)[keyof typeof customizationOptionStoreStatusCode]
