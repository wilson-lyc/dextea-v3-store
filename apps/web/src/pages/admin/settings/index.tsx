import { ScrollArea } from "@/shared/ui/scroll-area"
import { useStore } from "@/app/store-provider"
import { StoreInfoCard } from "@/features/store-settings/components/store-info-card"
import { StoreStatusCard } from "@/features/store-settings/components/store-status-card"
import { ResetPasswordCard } from "@/features/store-settings/components/reset-password-card"

export default function StoreSettingsPage() {
  const { store, loading, updateStore } = useStore()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">无法获取门店信息</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
        <StoreInfoCard store={store} />
        <StoreStatusCard
          store={store}
          onStatusUpdated={(status) => updateStore({ ...store, status })}
        />
        <ResetPasswordCard />
      </div>
    </ScrollArea>
  )
}
