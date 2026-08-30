export function buildStoreStatusMap<V extends number>(
  ids: readonly number[],
  fallback: V,
  overrides: Iterable<readonly [number, number]>,
  parse: (raw: number) => V
): Map<number, V> {
  const result = new Map<number, V>()

  for (const id of ids) {
    result.set(id, fallback)
  }

  for (const [id, raw] of overrides) {
    result.set(id, parse(raw))
  }

  return result
}
