/**
 * Coercion helpers для ParamsCodec
 * Преобразуют unknown значения в типизированные
 */

/**
 * Coerce в string
 */
export function coerceString(v: unknown): string | undefined {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return undefined
}

/**
 * Coerce в number
 */
export function coerceNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && !isNaN(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return isNaN(n) ? undefined : n
  }
  return undefined
}

/**
 * Coerce в boolean
 */
export function coerceBoolean(v: unknown): boolean | undefined {
  if (typeof v === 'boolean') return v
  if (v === 'true' || v === '1') return true
  if (v === 'false' || v === '0') return false
  return undefined
}

/**
 * Coerce в enum значение
 */
export function coerceEnum<T extends string>(values: readonly T[]) {
  return (v: unknown): T | undefined => {
    if (typeof v === 'string' && values.includes(v as T)) {
      return v as T
    }
    return undefined
  }
}

/**
 * Coerce JSON строку в объект
 */
export function coerceJson<T>(v: unknown): T | undefined {
  if (typeof v === 'object' && v !== null) return v as T
  if (typeof v === 'string') {
    try {
      return JSON.parse(v) as T
    } catch {
      return undefined
    }
  }
  return undefined
}

/**
 * Объект с coerce функциями для удобного использования
 * @example
 * const codec: ParamsCodec<MyParams> = {
 *   coerce: (raw) => ({
 *     id: coerce.string(raw.id),
 *     count: coerce.number(raw.count),
 *     active: coerce.boolean(raw.active),
 *     status: coerce.enum(['pending', 'done'])(raw.status)
 *   }),
 *   serialize: (p) => ({ ... })
 * }
 */
export const coerce = {
  string: coerceString,
  number: coerceNumber,
  boolean: coerceBoolean,
  enum: coerceEnum,
  json: coerceJson,
} as const
