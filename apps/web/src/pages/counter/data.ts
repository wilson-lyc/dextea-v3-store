import { OrderMakingStatus, OrderPaymentStatus } from "@dextea/constraints"

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  note?: string
}

export interface Order {
  id: string
  code: string
  customer: string
  type: "堂食" | "外带"
  paymentStatus: number
  makingStatus: number
  items: OrderItem[]
  total: number
  createdAt: string
}

export const PAID_PAYMENT_STATUS = OrderPaymentStatus.keyMap.PAID

export function getOrderStatus(order: Order): string {
  if (order.paymentStatus !== PAID_PAYMENT_STATUS) {
    return OrderPaymentStatus.getItemByValue(order.paymentStatus)!.label
  }
  return OrderMakingStatus.getItemByValue(order.makingStatus)!.label
}

export const activeOrders: Order[] = [
  {
    id: "o1",
    code: "A001",
    customer: "王女士",
    type: "堂食",
    paymentStatus: 2,
    makingStatus: 1,
    items: [
      { id: "m1", name: "德贤招牌奶茶", price: 16, quantity: 1 },
      { id: "m11", name: "芝士薯条", price: 12, quantity: 1 },
    ],
    total: 28,
    createdAt: "2026-08-12 09:18",
  },
  {
    id: "o2",
    code: "A002",
    customer: "外卖订单",
    type: "外带",
    paymentStatus: 2,
    makingStatus: 0,
    items: [
      { id: "m8", name: "生椰拿铁", price: 20, quantity: 2 },
    ],
    total: 40,
    createdAt: "2026-08-12 09:21",
  },
  {
    id: "o3",
    code: "A003",
    customer: "李先生",
    type: "堂食",
    paymentStatus: 2,
    makingStatus: 2,
    items: [
      { id: "m5", name: "杨枝甘露", price: 22, quantity: 1 },
      { id: "m12", name: "提拉米苏杯", price: 16, quantity: 1 },
    ],
    total: 38,
    createdAt: "2026-08-12 09:23",
  },
  {
    id: "o4",
    code: "A004",
    customer: "张同学",
    type: "外带",
    paymentStatus: 2,
    makingStatus: 0,
    items: [
      { id: "m3", name: "茉香奶绿", price: 15, quantity: 1 },
      { id: "m10", name: "脏脏可可曲奇", price: 9, quantity: 2 },
    ],
    total: 33,
    createdAt: "2026-08-12 09:26",
  },
  {
    id: "o5",
    code: "A005",
    customer: "赵先生",
    type: "堂食",
    paymentStatus: 2,
    makingStatus: 1,
    items: [
      { id: "m7", name: "澳白", price: 19, quantity: 1 },
      { id: "m9", name: "美式咖啡", price: 14, quantity: 1 },
    ],
    total: 33,
    createdAt: "2026-08-12 09:28",
  },
  {
    id: "o6",
    code: "A006",
    customer: "外卖订单",
    type: "外带",
    paymentStatus: 2,
    makingStatus: 2,
    items: [
      { id: "m4", name: "满杯红柚", price: 20, quantity: 3 },
    ],
    total: 60,
    createdAt: "2026-08-12 09:30",
  },
  {
    id: "o7",
    code: "A007",
    customer: "陈女士",
    type: "堂食",
    paymentStatus: 2,
    makingStatus: 0,
    items: [
      { id: "m2", name: "黑糖珍珠鲜奶", price: 18, quantity: 1 },
      { id: "m6", name: "葡萄冰萃", price: 21, quantity: 1 },
      { id: "m11", name: "芝士薯条", price: 12, quantity: 1 },
    ],
    total: 51,
    createdAt: "2026-08-12 09:32",
  },
  {
    id: "o8",
    code: "A008",
    customer: "刘先生",
    type: "外带",
    paymentStatus: 2,
    makingStatus: 1,
    items: [
      { id: "m8", name: "生椰拿铁", price: 20, quantity: 1 },
      { id: "m12", name: "提拉米苏杯", price: 16, quantity: 1 },
    ],
    total: 36,
    createdAt: "2026-08-12 09:34",
  },
  {
    id: "o9",
    code: "A009",
    customer: "外卖订单",
    type: "外带",
    paymentStatus: 2,
    makingStatus: 3,
    items: [
      { id: "m1", name: "德贤招牌奶茶", price: 16, quantity: 2 },
    ],
    total: 32,
    createdAt: "2026-08-12 09:36",
  },
  {
    id: "o10",
    code: "A010",
    customer: "周同学",
    type: "堂食",
    paymentStatus: 2,
    makingStatus: 2,
    items: [
      { id: "m5", name: "杨枝甘露", price: 22, quantity: 2 },
    ],
    total: 44,
    createdAt: "2026-08-12 09:37",
  },
  {
    id: "o11",
    code: "A011",
    customer: "吴女士",
    type: "堂食",
    paymentStatus: 2,
    makingStatus: 1,
    items: [
      { id: "m4", name: "满杯红柚", price: 20, quantity: 1 },
      { id: "m10", name: "脏脏可可曲奇", price: 9, quantity: 1 },
    ],
    total: 29,
    createdAt: "2026-08-12 09:39",
  },
  {
    id: "o12",
    code: "A012",
    customer: "外卖订单",
    type: "外带",
    paymentStatus: 2,
    makingStatus: 0,
    items: [
      { id: "m3", name: "茉香奶绿", price: 15, quantity: 1 },
      { id: "m7", name: "澳白", price: 19, quantity: 1 },
      { id: "m12", name: "提拉米苏杯", price: 16, quantity: 1 },
    ],
    total: 50,
    createdAt: "2026-08-12 09:41",
  },
  {
    id: "o13",
    code: "A013",
    customer: "孙先生",
    type: "外带",
    paymentStatus: 0,
    makingStatus: 0,
    items: [
      { id: "m8", name: "生椰拿铁", price: 20, quantity: 1 },
    ],
    total: 20,
    createdAt: "2026-08-12 09:43",
  },
  {
    id: "o14",
    code: "A014",
    customer: "钱女士",
    type: "堂食",
    paymentStatus: 1,
    makingStatus: 0,
    items: [
      { id: "m2", name: "黑糖珍珠鲜奶", price: 18, quantity: 1 },
      { id: "m9", name: "美式咖啡", price: 14, quantity: 1 },
    ],
    total: 32,
    createdAt: "2026-08-12 09:44",
  },
  {
    id: "o15",
    code: "A015",
    customer: "大客户",
    type: "堂食",
    paymentStatus: 2,
    makingStatus: 1,
    items: [
      { id: "m1", name: "德贤招牌奶茶", price: 16, quantity: 3 },
      { id: "m2", name: "黑糖珍珠鲜奶", price: 18, quantity: 2 },
      { id: "m3", name: "茉香奶绿", price: 15, quantity: 1 },
      { id: "m4", name: "满杯红柚", price: 20, quantity: 4 },
      { id: "m5", name: "杨枝甘露", price: 22, quantity: 2 },
      { id: "m6", name: "葡萄冰萃", price: 21, quantity: 1 },
      { id: "m7", name: "澳白", price: 19, quantity: 3 },
      { id: "m8", name: "生椰拿铁", price: 20, quantity: 2 },
      { id: "m9", name: "美式咖啡", price: 14, quantity: 5 },
      { id: "m10", name: "脏脏可可曲奇", price: 9, quantity: 6 },
      { id: "m11", name: "芝士薯条", price: 12, quantity: 2 },
      { id: "m12", name: "提拉米苏杯", price: 16, quantity: 3 },
      { id: "m13", name: "抹茶千层", price: 24, quantity: 1 },
      { id: "m14", name: "百香果双响炮", price: 17, quantity: 4 },
      { id: "m15", name: "柠檬冰茶", price: 13, quantity: 2 },
    ],
    total: 655,
    createdAt: "2026-08-12 09:50",
  },
]

export const storeName = "德贤茶 · 中心广场店"
