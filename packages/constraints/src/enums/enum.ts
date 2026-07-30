export interface EnumItem {
  readonly code: number
  readonly key: string
  readonly label: string
}

export function labelOf(items: readonly EnumItem[], code: number): string | undefined {
  return items.find((item) => item.code === code)?.label
}

export function codeMap<T extends readonly EnumItem[]>(items: T) {
  return Object.fromEntries(items.map((item) => [item.key, item.code])) as {
    readonly [K in T[number]['key']]: T[number]['code']
  }
}
