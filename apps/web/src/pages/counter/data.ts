export type OrderStatus = "待制作" | "制作中" | "待取餐" | "已完成"

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
  status: OrderStatus
  items: OrderItem[]
  total: number
  createdAt: string
}

export const activeOrders: Order[] = [
  {
    id: "o1",
    code: "A001",
    customer: "王女士",
    type: "堂食",
    status: "制作中",
    items: [
      { id: "m1", name: "德贤招牌奶茶", price: 16, quantity: 1 },
      { id: "m11", name: "芝士薯条", price: 12, quantity: 1 },
    ],
    total: 28,
    createdAt: "14:02",
  },
  {
    id: "o2",
    code: "A002",
    customer: "外卖订单",
    type: "外带",
    status: "待制作",
    items: [
      { id: "m8", name: "生椰拿铁", price: 20, quantity: 2 },
    ],
    total: 40,
    createdAt: "14:05",
  },
  {
    id: "o3",
    code: "A003",
    customer: "李先生",
    type: "堂食",
    status: "待取餐",
    items: [
      { id: "m5", name: "杨枝甘露", price: 22, quantity: 1 },
      { id: "m12", name: "提拉米苏杯", price: 16, quantity: 1 },
    ],
    total: 38,
    createdAt: "14:08",
  },
]

export const storeName = "德贤茶 · 中心广场店"
