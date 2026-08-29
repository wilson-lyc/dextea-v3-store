import type { CustomizationItemView, ProductView } from "@dextea/constraints"

import { ScrollArea } from "@/shared/ui/scroll-area"
import { Switch } from "@/shared/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { OPTION_STORE_ACTIVE } from "@/features/product/model"

interface CustomizeDialogProps {
  target: ProductView | null
  items: CustomizationItemView[]
  loading: boolean
  toggling: boolean
  onOpenChange: (open: boolean) => void
  onToggleOption: (optionId: number, checked: boolean) => void
}

export function CustomizeDialog({
  target,
  items,
  loading,
  toggling,
  onOpenChange,
  onToggleOption,
}: CustomizeDialogProps) {
  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>管理客制化</DialogTitle>
          <DialogDescription>
            {target !== null && `「${target.name}」的客制化选项`}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">加载中...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">该商品暂无客制化项目</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 pr-2">
              {items.map((item) => (
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
                          disabled={toggling}
                          onCheckedChange={(checked) => onToggleOption(option.id, checked)}
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
  )
}
