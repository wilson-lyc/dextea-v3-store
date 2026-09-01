import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { formatStoreAddress, type StoreView } from "@/features/store/model"

interface StoreInfoCardProps {
  store: StoreView
}

export function StoreInfoCard({ store }: StoreInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>门店信息</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">门店名称</dt>
            <dd className="font-medium">{store.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">联系电话</dt>
            <dd className="font-medium">{store.phone}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">营业时间</dt>
            <dd className="font-medium">{store.businessHours}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">邮箱</dt>
            <dd className="font-medium">{store.email}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">门店地址</dt>
            <dd className="font-medium">{formatStoreAddress(store)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
