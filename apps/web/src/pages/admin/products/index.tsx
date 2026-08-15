import { useEffect, useState } from "react"
import { ListChecksIcon, Package, RefreshCwIcon, XIcon } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ProductStoreStatus,
  customizationOptionStoreStatusCode,
} from "@dextea/constraints"
import {
  productApi,
  type CustomizationItemView,
  type ProductView,
} from "@/lib/api/product"
import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api/request"
import { logger } from "@/lib/logger"
import { toast } from "@/lib/toast"

const STORE_ACTIVE = ProductStoreStatus.getValueByKey("ACTIVE")
const STORE_DISABLED = ProductStoreStatus.getValueByKey("DISABLED")

const OPTION_STORE_ACTIVE = customizationOptionStoreStatusCode.STORE_ACTIVE
const OPTION_STORE_DISABLED = customizationOptionStoreStatusCode.STORE_DISABLED

type StoreFilter = "ALL" | "ACTIVE" | "DISABLED"

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductView[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<ProductView | null>(null)
  const [toggling, setToggling] = useState(false)
  const [filter, setFilter] = useState<StoreFilter>("ALL")
  const [refreshing, setRefreshing] = useState(false)
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [batchTarget, setBatchTarget] = useState<number | null>(null)
  const [batchSubmitting, setBatchSubmitting] = useState(false)
  const [customizeTarget, setCustomizeTarget] = useState<ProductView | null>(null)
  const [customizationItems, setCustomizationItems] = useState<CustomizationItemView[]>([])
  const [customizationsLoading, setCustomizationsLoading] = useState(false)

  const activeCount = products.filter((p) => p.storeStatus === STORE_ACTIVE).length
  const disabledCount = products.filter((p) => p.storeStatus === STORE_DISABLED).length

  const filteredProducts = products.filter((product) => {
    if (filter === "ACTIVE") return product.storeStatus === STORE_ACTIVE
    if (filter === "DISABLED") return product.storeStatus === STORE_DISABLED
    return true
  })

  async function loadProducts() {
    try {
      const data = await productApi.listActive()
      setProducts(data)
    } catch (err) {
      logger.error("获取商品列表失败", err)
      toast.error(err instanceof ApiError ? err.message : "获取商品列表失败")
    }
  }

  useEffect(() => {
    setLoading(true)
    loadProducts().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (customizeTarget === null) return
    let cancelled = false
    setCustomizationsLoading(true)
    productApi
      .listCustomizations(customizeTarget.id)
      .then((data) => {
        if (!cancelled) setCustomizationItems(data)
      })
      .catch((err) => {
        if (cancelled) return
        logger.error("获取客制化列表失败", err)
        toast.error(err instanceof ApiError ? err.message : "获取客制化列表失败")
      })
      .finally(() => {
        if (!cancelled) setCustomizationsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [customizeTarget])

  async function handleRefresh() {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
  }

  async function confirmToggle() {
    if (!pending) return
    setToggling(true)
    try {
      const { storeStatus } = await productApi.toggleStoreStatus(pending.id)
      setProducts((prev) =>
        prev.map((item) =>
          item.id === pending.id ? { ...item, storeStatus } : item,
        ),
      )
      setPending(null)
    } catch (err) {
      logger.error("切换商品门店状态失败", err)
      toast.error(err instanceof ApiError ? err.message : "切换商品门店状态失败")
    } finally {
      setToggling(false)
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function toggleOption(itemId: number, optionId: number) {
    setCustomizationItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              options: item.options.map((option) =>
                option.id === optionId
                  ? {
                      ...option,
                      storeStatus:
                        option.storeStatus === OPTION_STORE_ACTIVE
                          ? OPTION_STORE_DISABLED
                          : OPTION_STORE_ACTIVE,
                    }
                  : option,
              ),
            }
          : item,
      ),
    )
  }

  function exitBatchMode() {
    setBatchMode(false)
    setSelectedIds([])
  }

  async function confirmBatch() {
    if (batchTarget === null || selectedIds.length === 0) return
    setBatchSubmitting(true)
    try {
      await productApi.batchSetStoreStatus(selectedIds, batchTarget)
      setProducts((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id) ? { ...item, storeStatus: batchTarget } : item,
        ),
      )
      setBatchTarget(null)
      exitBatchMode()
    } catch (err) {
      logger.error("批量切换门店状态失败", err)
      toast.error(err instanceof ApiError ? err.message : "批量切换门店状态失败")
    } finally {
      setBatchSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b px-6 py-3">
        {batchMode ? (
          <>
            <Button variant="ghost" size="sm" onClick={exitBatchMode}>
              <XIcon className="size-4" />
              取消
            </Button>
            <span className="text-sm text-muted-foreground">
              已选 {selectedIds.length} 项
            </span>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              disabled={selectedIds.length === 0 || batchSubmitting}
              onClick={() => setBatchTarget(STORE_DISABLED)}
            >
              批量下架
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIds.length === 0 || batchSubmitting}
              onClick={() => setBatchTarget(STORE_ACTIVE)}
            >
              批量上架
            </Button>
          </>
        ) : (
          <>
            {(
              [
                { key: "ALL", label: "全部", count: products.length },
                { key: "ACTIVE", label: "可售", count: activeCount },
                { key: "DISABLED", label: "售罄", count: disabledCount },
              ] as { key: StoreFilter; label: string; count: number }[]
            ).map((item) => (
              <Button
                key={item.key}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFilter(item.key)}
                className={cn(
                  filter === item.key
                    ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
                <span className="text-xs tabular-nums">{item.count}</span>
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              disabled={refreshing || loading}
              onClick={() => setBatchMode(true)}
            >
              <ListChecksIcon className="size-4" />
              批量操作
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={refreshing || loading}
              onClick={handleRefresh}
            >
              <RefreshCwIcon className={cn("size-4", refreshing && "animate-spin")} />
              刷新
            </Button>
          </>
        )}
      </div>

      <ScrollArea className="flex-1 px-6 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Package className="size-8" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {products.length === 0 ? "暂无上架商品" : "无符合条件的商品"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length === 0
                ? "全局上架的商品将显示在这里"
                : "请调整筛选条件后重试"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-border p-4 transition hover:border-ring hover:shadow-sm",
                batchMode && selectedIds.includes(product.id) && "border-primary",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {batchMode && (
                    <Checkbox
                      checked={selectedIds.includes(product.id)}
                      onCheckedChange={() => toggleSelect(product.id)}
                      className="mt-0.5"
                    />
                  )}
                  <h3 className="text-sm font-semibold leading-snug">
                    {product.name}
                  </h3>
                </div>
                {(() => {
                  const color = ProductStoreStatus.getColor(product.storeStatus)
                  return (
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium"
                      style={{
                        color: color?.text,
                        backgroundColor: color?.background,
                        border: color ? `1px solid ${color.border}` : undefined,
                      }}
                    >
                      {ProductStoreStatus.getLabel(product.storeStatus)}
                    </span>
                  )
                })()}
              </div>
              {product.description && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {product.description}
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <span className="text-base font-semibold">
                  ¥{product.price.toFixed(2)}
                </span>
                {!batchMode && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomizeTarget(product)}
                    >
                      管理客制化
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={toggling}
                      onClick={() => setPending(product)}
                      className={cn(
                        product.storeStatus === STORE_ACTIVE
                          ? "border-red-600/60 text-red-600 hover:border-red-600 hover:bg-red-600/10 hover:text-red-700"
                          : "border-green-600/60 text-green-600 hover:border-green-600 hover:bg-green-600/10 hover:text-green-700",
                      )}
                    >
                      {product.storeStatus === STORE_ACTIVE ? "下架" : "上架"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </ScrollArea>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认切换门店状态</AlertDialogTitle>
            <AlertDialogDescription>
              {pending !== null && (
                <>
                  确定要将「{pending.name}」的门店状态切换为
                  <span className="font-medium text-foreground">
                    {" "}
                    {pending.storeStatus === ProductStoreStatus.getValueByKey("ACTIVE")
                      ? ProductStoreStatus.getLabel(
                          ProductStoreStatus.getValueByKey("DISABLED"),
                        )
                      : ProductStoreStatus.getLabel(
                          ProductStoreStatus.getValueByKey("ACTIVE"),
                        )}{" "}
                  </span>
                  吗？
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="default"
              disabled={toggling}
              onClick={confirmToggle}
            >
              {toggling ? "处理中..." : "确认切换"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={batchTarget !== null}
        onOpenChange={(open) => {
          if (!open) setBatchTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量切换门店状态</AlertDialogTitle>
            <AlertDialogDescription>
              {batchTarget !== null && (
                <>
                  确定要将选中的 {selectedIds.length} 个商品批量切换为
                  <span className="font-medium text-foreground">
                    {" "}
                    {ProductStoreStatus.getLabel(batchTarget)}{" "}
                  </span>
                  吗？
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="default"
              disabled={batchSubmitting}
              onClick={confirmBatch}
            >
              {batchSubmitting ? "处理中..." : "确认切换"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={customizeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCustomizeTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>管理客制化</DialogTitle>
            <DialogDescription>
              {customizeTarget !== null && `「${customizeTarget.name}」的客制化选项`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {customizationsLoading ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">加载中...</p>
              </div>
            ) : customizationItems.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">该商品暂无客制化项目</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 pr-2">
                {customizationItems.map((item) => (
                  <section key={item.id}>
                    <h4 className="mb-2 text-sm font-semibold">{item.name}</h4>
                    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                      {item.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between gap-3 px-3 py-2.5"
                        >
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm">{option.name}</span>
                            {option.price > 0 && (
                              <span className="text-xs text-muted-foreground">
                                +¥{option.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <Switch
                            checked={option.storeStatus === OPTION_STORE_ACTIVE}
                            onCheckedChange={() => toggleOption(item.id, option.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
