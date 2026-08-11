import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Coffee,
  Flame,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/lib/toast"
import {
  activeOrders,
  categories,
  menuItems,
  storeName,
  type MenuItem,
} from "./data"

interface CartEntry {
  item: MenuItem
  quantity: number
  note: string
}

const statusStyles: Record<string, string> = {
  待制作: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  制作中: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  待取餐: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  已完成: "bg-muted text-muted-foreground",
}

export default function CounterPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState(categories[0].id)
  const [cart, setCart] = useState<Record<string, CartEntry>>({})
  const [customer, setCustomer] = useState("")
  const [orderType, setOrderType] = useState<"堂食" | "外带">("堂食")

  const filteredItems = useMemo(
    () => menuItems.filter((item) => item.categoryId === activeCategory),
    [activeCategory]
  )

  const cartList = useMemo(() => Object.values(cart), [cart])
  const totalQuantity = cartList.reduce((sum, e) => sum + e.quantity, 0)
  const totalPrice = cartList.reduce(
    (sum, e) => sum + e.item.price * e.quantity,
    0
  )

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev[item.id]
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: existing ? existing.quantity + 1 : 1,
          note: existing?.note ?? "",
        },
      }
    })
  }

  function changeQuantity(id: string, delta: number) {
    setCart((prev) => {
      const existing = prev[id]
      if (!existing) return prev
      const quantity = existing.quantity + delta
      if (quantity <= 0) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: { ...existing, quantity } }
    })
  }

  function updateNote(id: string, note: string) {
    setCart((prev) => {
      const existing = prev[id]
      if (!existing) return prev
      return { ...prev, [id]: { ...existing, note } }
    })
  }

  function clearCart() {
    setCart({})
    setCustomer("")
  }

  function handleCheckout() {
    if (cartList.length === 0) {
      toast.error("请先选择商品")
      return
    }
    toast.success(
      `已下单：${orderType} · ${cartList.length} 种商品 · ¥${totalPrice.toFixed(2)}`
    )
    clearCart()
  }

  return (
    <div className="flex h-svh flex-col bg-muted/30">
      <header className="flex items-center justify-between gap-4 border-b bg-background px-6 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => navigate("/")}
            aria-label="返回首页"
          >
            <ArrowLeft />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Coffee className="size-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold">{storeName}</h1>
              <p className="text-xs text-muted-foreground">前台点单收银</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">当前队列</span>
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {activeOrders.length}
          </span>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[1fr_360px_320px]">
        <section className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex gap-2 overflow-x-auto border-b bg-background px-4 py-3">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={activeCategory === cat.id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
          <div className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto p-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const entry = cart[item.id]
              return (
                <Card key={item.id} size="sm" className="flex flex-col">
                  <CardHeader className="pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="flex items-center gap-1.5">
                        {item.name}
                        {item.hot && (
                          <Flame className="size-3.5 text-orange-500" />
                        )}
                      </CardTitle>
                      <span className="shrink-0 text-base font-semibold">
                        ¥{item.price}
                      </span>
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </CardHeader>
                  <CardFooter className="justify-end pt-3">
                    {entry ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon-xs"
                          variant="outline"
                          onClick={() => changeQuantity(item.id, -1)}
                          aria-label="减少"
                        >
                          <Minus />
                        </Button>
                        <span className="w-5 text-center text-sm font-medium">
                          {entry.quantity}
                        </span>
                        <Button
                          size="icon-xs"
                          variant="outline"
                          onClick={() => changeQuantity(item.id, 1)}
                          aria-label="增加"
                        >
                          <Plus />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                      >
                        <Plus />
                        加入
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="flex min-h-0 flex-col border-l bg-background">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingCart className="size-4" />
              购物清单
              {totalQuantity > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {totalQuantity}
                </span>
              )}
            </h2>
            {cartList.length > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={clearCart}
                className="text-muted-foreground"
              >
                <Trash2 />
                清空
              </Button>
            )}
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
            {cartList.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <ShoppingCart className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">还没有选择商品</p>
              </div>
            ) : (
              cartList.map((entry) => (
                <div
                  key={entry.item.id}
                  className="flex flex-col gap-2 rounded-xl border border-border p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {entry.item.name}
                    </span>
                    <span className="text-sm font-semibold">
                      ¥{(entry.item.price * entry.quantity).toFixed(2)}
                    </span>
                  </div>
                  <Input
                    placeholder="备注（如：少糖、去冰）"
                    value={entry.note}
                    onChange={(e) => updateNote(entry.item.id, e.target.value)}
                    className="h-7 text-xs"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="icon-xs"
                        variant="outline"
                        onClick={() => changeQuantity(entry.item.id, -1)}
                        aria-label="减少"
                      >
                        <Minus />
                      </Button>
                      <span className="w-5 text-center text-sm">
                        {entry.quantity}
                      </span>
                      <Button
                        size="icon-xs"
                        variant="outline"
                        onClick={() => changeQuantity(entry.item.id, 1)}
                        aria-label="增加"
                      >
                        <Plus />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ¥{entry.item.price} / 份
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t p-4">
            <div className="mb-3 grid grid-cols-2 gap-2">
              {(["堂食", "外带"] as const).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={orderType === type ? "default" : "outline"}
                  onClick={() => setOrderType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
            <Input
              placeholder="顾客称呼 / 取餐号"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="mb-3"
            />
            <div className="mb-3 flex items-end justify-between">
              <span className="text-sm text-muted-foreground">合计</span>
              <span className="text-2xl font-semibold">
                ¥{totalPrice.toFixed(2)}
              </span>
            </div>
            <Button className="w-full" size="lg" onClick={handleCheckout}>
              确认下单 · 收银
            </Button>
          </div>
        </section>

        <section className="hidden min-h-0 flex-col border-l bg-background lg:flex">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">订单队列</h2>
            <p className="text-xs text-muted-foreground">实时制作与取餐状态</p>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {order.code}
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-normal text-muted-foreground">
                      {order.type}
                    </span>
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  {order.items.map((line) => (
                    <li key={line.id} className="flex justify-between">
                      <span>
                        {line.name} ×{line.quantity}
                      </span>
                      <span>¥{line.price * line.quantity}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t pt-2 text-xs">
                  <span className="text-muted-foreground">
                    {order.customer} · {order.createdAt}
                  </span>
                  <span className="font-semibold">¥{order.total}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
