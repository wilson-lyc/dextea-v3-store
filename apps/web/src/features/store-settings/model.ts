import { StoreStatus, type StoreStatusCode } from "@dextea/constraints"

export const STORE_STATUS_META = [
  { code: StoreStatus.keyMap.CLOSED, description: "暂时关闭，不接新单" },
  { code: StoreStatus.keyMap.OPEN, description: "门店正常营业，可接单" },
  { code: StoreStatus.keyMap.PENDING, description: "门店尚未开业" },
  { code: StoreStatus.keyMap.DEFUNCT, description: "门店已永久关闭" },
] as const satisfies ReadonlyArray<{ code: StoreStatusCode; description: string }>

export const TOGGLEABLE_STATUS_CODES = [
  StoreStatus.keyMap.CLOSED,
  StoreStatus.keyMap.OPEN,
] as const satisfies ReadonlyArray<StoreStatusCode>

const DESCRIPTION_BY_CODE = new Map<number, string>(
  STORE_STATUS_META.map((item) => [item.code, item.description]),
)

export function getStoreStatusDescription(code: StoreStatusCode): string {
  return DESCRIPTION_BY_CODE.get(code) ?? ""
}

export function isToggleableStoreStatus(code: StoreStatusCode): boolean {
  return (TOGGLEABLE_STATUS_CODES as readonly number[]).includes(code)
}
