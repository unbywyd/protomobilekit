import type { FixtureRefs } from '../screens/types'

// =============================================================================
// Fixture Refs Store
// Source of truth для дефолтных данных
// =============================================================================

let fixtureRefs: FixtureRefs | null = null
let isSeeded = false

// Listeners for reactivity
type FixtureListener = () => void
const listeners = new Set<FixtureListener>()

/**
 * Устанавливает fixture refs
 * ВАЖНО: вызывать только после seed данных!
 *
 * @example
 * // В seedData()
 * const r1 = repo('Restaurant').create({ ... })
 * const o1 = repo('Order').create({ ... })
 *
 * setFixtureRefs({
 *   customer: {
 *     defaultRestaurantId: r1.id,
 *     defaultOrderId: o1.id,
 *   }
 * })
 */
export function setFixtureRefs<T extends FixtureRefs>(refs: T): void {
  fixtureRefs = refs
  isSeeded = true
  notifyListeners()
}

/**
 * Получает fixture ref
 *
 * @example
 * const restaurantId = getFixtureRef('customer', 'defaultRestaurantId')
 */
export function getFixtureRef<A extends keyof FixtureRefs>(
  app: A,
  key: keyof FixtureRefs[A]
): string | undefined {
  if (!isSeeded) {
    console.warn(
      '[FixtureRefs] Accessing refs before seed. Call setFixtureRefs() after seedData().'
    )
  }

  const appRefs = fixtureRefs?.[app]
  if (!appRefs) return undefined

  return appRefs[key] as string | undefined
}

/**
 * Проверяет, готовы ли fixtures
 */
export function isFixturesReady(): boolean {
  return isSeeded
}

/**
 * Получает все refs для приложения
 */
export function getAppFixtureRefs<A extends keyof FixtureRefs>(
  app: A
): FixtureRefs[A] | undefined {
  return fixtureRefs?.[app]
}

/**
 * Очищает fixture refs (для тестов)
 */
export function clearFixtureRefs(): void {
  fixtureRefs = null
  isSeeded = false
  notifyListeners()
}

/**
 * Подписка на изменения fixture refs
 */
export function subscribeFixtures(listener: FixtureListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notifyListeners(): void {
  listeners.forEach(l => l())
}
