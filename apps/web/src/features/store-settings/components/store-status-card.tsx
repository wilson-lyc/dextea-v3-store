import type { StoreStatusCode } from "@dextea/constraints"
import { StoreStatus } from "@dextea/constraints"
import { TriangleAlertIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { ConfirmDialog } from "@/shared/components/confirm-dialog"
import type { StoreView } from "@/features/store/model"
import { useStoreStatus } from "@/features/store-settings/hooks/use-store-status"
import {
  TOGGLEABLE_STATUS_CODES,
  getStoreStatusDescription,
  isToggleableStoreStatus,
} from "@/features/store-settings/model"

interface StoreStatusCardProps {
  store: StoreView
  onStatusUpdated: (status: StoreStatusCode) => void
}

export function StoreStatusCard({ store, onStatusUpdated }: StoreStatusCardProps) {
  const { pendingStatus, updating, requestUpdate, dismiss, confirm } =
    useStoreStatus(onStatusUpdated)

  const canToggle = isToggleableStoreStatus(store.status)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>门店状态</CardTitle>
          <CardDescription>
            {canToggle ? "切换门店营业状态" : "当前状态不可切换"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canToggle ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {TOGGLEABLE_STATUS_CODES.map((code) => {
                const isActive = store.status === code
                return (
                  <button
                    key={code}
                    type="button"
                    disabled={updating}
                    onClick={() => requestUpdate(code)}
                    className={[
                      "flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition",
                      "hover:border-ring hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      isActive
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {StoreStatus.getLabel(code)}
                      </span>
                      {isActive && (
                        <span className="rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                          当前
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getStoreStatusDescription(code)}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <TriangleAlertIcon className="size-5 shrink-0 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {StoreStatus.getLabel(store.status)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getStoreStatusDescription(store.status)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingStatus !== null}
        title="确认切换门店状态"
        confirmLabel="确认切换"
        pending={updating}
        onOpenChange={(open) => {
          if (!open) dismiss()
        }}
        onConfirm={confirm}
        description={
          pendingStatus !== null && (
            <>
              确定要将门店状态切换为
              <span className="font-medium text-foreground">
                {" "}
                {StoreStatus.getLabel(pendingStatus)}{" "}
              </span>
              吗？
            </>
          )
        }
      />
    </>
  )
}
