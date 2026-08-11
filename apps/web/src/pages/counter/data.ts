export interface Category {
  id: string
  name: string
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  tags?: string[]
  hot?: boolean
}

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
  status: "待制作" | "制作中" | "待取餐" | "已完成"
  items: OrderItem[]
  total: number
  createdAt: string
}

export const categories: Category[] = [
  { id: "tea", name: "招牌奶茶" },
  { id: "fruit", name: "鲜果茶" },
  { id: "coffee", name: "咖啡" },
  { id: "snack", name: "小食" },
]

export const menuItems: MenuItem[] = [
  {
    id: "m1",
    categoryId: "tea",
    name: "德贤招牌奶茶",
    description: "锡兰红茶 + 北海道牛乳，经典醇厚",
    price: 16,
    tags: ["经典"],
    hot: true,
  },
  {
    id: "m2",
    categoryId: "tea",
    name: "黑糖珍珠鲜奶",
    description: "手煮黑糖珍珠，搭配鲜牛乳",
    price: 18,
    tags: ["人气"],
  },
  {
    id: "m3",
    categoryId: "tea",
    name: "茉香奶绿",
    description: "茉莉绿茶底，清新回甘",
    price: 15,
  },
  {
    id: "m4",
    categoryId: "fruit",
    name: "满杯红柚",
    description: "现剥红西柚 + 绿妍茶底",
    price: 20,
    tags: ["鲜果"],
    hot: true,
  },
  {
    id: "m5",
    categoryId: "fruit",
    name: "杨枝甘露",
    description: "芒果 + 西米 + 西柚，港式经典",
    price: 22,
    tags: ["人气"],
  },
  {
    id: "m6",
    categoryId: "fruit",
    name: "葡萄冰萃",
    description: "巨峰葡萄果肉 + 乌龙冷萃",
    price: 21,
  },
  {
    id: "m7",
    categoryId: "coffee",
    name: "澳白",
    description: "双重浓缩 + 丝滑奶泡",
    price: 19,
    tags: ["醇香"],
  },
  {
    id: "m8",
    categoryId: "coffee",
    name: "生椰拿铁",
    description: "印尼生椰乳 + 浓缩咖啡",
    price: 20,
    tags: ["人气"],
    hot: true,
  },
  {
    id: "m9",
    categoryId: "coffee",
    name: "美式咖啡",
    description: "清爽不苦，唤醒一整天",
    price: 14,
  },
  {
    id: "m10",
    categoryId: "snack",
    name: "脏脏可可曲奇",
    description: "现烤，外脆内软",
    price: 9,
  },
  {
    id: "m11",
    categoryId: "snack",
    name: "芝士薯条",
    description: "现炸薯条 + 帕玛森芝士粉",
    price: 12,
    tags: ["咸香"],
  },
  {
    id: "m12",
    categoryId: "snack",
    name: "提拉米苏杯",
    description: "马斯卡彭芝士，入口即化",
    price: 16,
  },
]

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
