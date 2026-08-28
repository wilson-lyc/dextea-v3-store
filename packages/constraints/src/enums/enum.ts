export interface EnumColor {
  readonly text: string
  readonly background: string
  readonly border: string
}

export interface EnumItemConfig {
  readonly key: string
  readonly value: number
  readonly label: string
  readonly color: EnumColor
}

export type EnumItem<K extends string = string, V extends number = number> = Omit<
  EnumItemConfig,
  'value'
> & { readonly key: K; readonly value: V }

export interface EnumInstance<K extends string = string, V extends number = number> {
  readonly items: readonly EnumItem<K, V>[]
  readonly keys: readonly K[]
  readonly values: readonly V[]
  readonly keyMap: Readonly<Record<K, V>>
  readonly valueMap: Readonly<Record<number, K>>
  readonly labelMap: Readonly<Record<number, string>>
  readonly colorMap: Readonly<Record<number, EnumColor>>
  getItemByKey(key: K): EnumItem<K> | undefined
  getItemByValue(value: number): EnumItem<K> | undefined
  getValueByKey(key: K): number | undefined
  getKeyByValue(value: number): K | undefined
  getLabel(value: number): string
  getColor(value: number): EnumColor | undefined
  hasValue(value: number): value is V
  hasKey(key: K): key is K
  toOptions(): ReadonlyArray<{ readonly label: string; readonly value: V }>
  schema(): ZodType<V>
}

import { z, type ZodType } from 'zod'

export function labelOf(items: readonly EnumItemConfig[], code: number): string | undefined {
  return items.find((item) => item.value === code)?.label
}

export function codeMap<const T extends readonly EnumItemConfig[]>(items: T) {
  return Object.fromEntries(items.map((item) => [item.key, item.value])) as {
    readonly [K in T[number]['key']]: T[number]['value']
  }
}

export function createEnum<const T extends readonly EnumItemConfig[]>(
  items: T,
): EnumInstance<T[number]['key'], T[number]['value']> {
  type Value = T[number]['value']
  const list = items as readonly EnumItem<T[number]['key']>[]
  const keyMap = Object.fromEntries(list.map((i) => [i.key, i.value])) as Record<T[number]['key'], Value>
  const valueMap = Object.fromEntries(list.map((i) => [i.value, i.key])) as Record<number, T[number]['key']>
  const labelMap = Object.fromEntries(list.map((i) => [i.value, i.label])) as Record<number, string>
  const colorMap = Object.fromEntries(list.map((i) => [i.value, i.color])) as Record<number, EnumColor>
  const validValues = list.map((i) => i.value)
  const valueSet = new Set<number>(validValues)

  return {
    items: list,
    keys: list.map((i) => i.key),
    values: validValues,
    keyMap,
    valueMap,
    labelMap,
    colorMap,
    getItemByKey: (key) => list.find((i) => i.key === key),
    getItemByValue: (value) => list.find((i) => i.value === value),
    getValueByKey: (key) => keyMap[key],
    getKeyByValue: (value) => valueMap[value],
    getLabel: (value) => labelMap[value] ?? String(value),
    getColor: (value) => colorMap[value],
    hasValue: (value): value is number => valueSet.has(value),
    hasKey: (key): key is T[number]['key'] => key in keyMap,
    toOptions: () => list.map((i) => ({ label: i.label, value: i.value })),
    schema: () =>
      z.literal(validValues as [Value, ...Value[]], { message: '无效的枚举值' }),
  }
}
