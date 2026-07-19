/** Sentinel stored in place of `undefined` so the value survives JSON serialization. */
export const SDT_UNDEFINED = '__sdt_undefined__'

export function cloneSnapshotValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === undefined) return SDT_UNDEFINED
  if (typeof value === 'function') return undefined
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return '[circular]'
  seen.add(value)

  if (Array.isArray(value)) return value.map((item) => cloneSnapshotValue(item, seen))
  if (value instanceof Date) return Number.isNaN(value.valueOf()) ? 'Invalid Date' : value.toISOString()
  if (value instanceof Map) {
    return Object.fromEntries(Array.from(value, ([key, item]) => [String(key), cloneSnapshotValue(item, seen)]))
  }
  if (value instanceof Set) return Array.from(value, (item) => cloneSnapshotValue(item, seen))
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    return Array.from(value as unknown as ArrayLike<unknown>, (item) => cloneSnapshotValue(item, seen))
  }

  const result: Record<string, unknown> = {}
  for (const key of Object.keys(value)) {
    try {
      result[key] = cloneSnapshotValue((value as Record<string, unknown>)[key], seen)
    } catch {
      result[key] = '[object]'
    }
  }
  return result
}

export function cloneSnapshotRecord(value: unknown): Record<string, unknown> {
  const cloned = cloneSnapshotValue(value)
  return cloned && typeof cloned === 'object' && !Array.isArray(cloned)
    ? cloned as Record<string, unknown>
    : {}
}
