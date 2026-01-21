import type { ScreenRegistryEntry, NavigatorType, ScreenOptions } from './types'

// Global screen registry
const screenRegistry = new Map<string, ScreenRegistryEntry>()

// Registry change listeners
type RegistryListener = () => void
const listeners = new Set<RegistryListener>()

/**
 * Register a screen in the global registry
 * @internal Used by Navigator component
 */
export function registerScreen(
  name: string,
  navigatorId: string,
  navigatorType: NavigatorType,
  options?: ScreenOptions,
  tab?: { label?: string; icon?: React.ReactNode; activeIcon?: React.ReactNode }
): void {
  const key = `${navigatorId}:${name}`
  screenRegistry.set(key, {
    name,
    options,
    navigatorId,
    navigatorType,
    tab,
  })
  notifyListeners()
}

/**
 * Unregister all screens for a navigator
 * @internal Used by Navigator component
 */
export function unregisterNavigatorScreens(navigatorId: string): void {
  for (const key of screenRegistry.keys()) {
    if (key.startsWith(`${navigatorId}:`)) {
      screenRegistry.delete(key)
    }
  }
  notifyListeners()
}

/**
 * Get all registered screens
 *
 * @example
 * ```tsx
 * import { getScreens } from 'mobilekit'
 *
 * // Get all screens
 * const screens = getScreens()
 * // [{ name: 'home', navigatorId: 'main', ... }, ...]
 *
 * // Get screens for specific navigator
 * const mainScreens = getScreens('main')
 * ```
 */
export function getScreens(navigatorId?: string): ScreenRegistryEntry[] {
  const entries = Array.from(screenRegistry.values())
  if (navigatorId) {
    return entries.filter(e => e.navigatorId === navigatorId)
  }
  return entries
}

/**
 * Get screen names (useful for documentation/routing)
 *
 * @example
 * ```tsx
 * const screenNames = getScreenNames()
 * // ['home', 'orders', 'profile']
 * ```
 */
export function getScreenNames(navigatorId?: string): string[] {
  return getScreens(navigatorId).map(s => s.name)
}

/**
 * Check if a screen exists
 */
export function hasScreen(name: string, navigatorId?: string): boolean {
  if (navigatorId) {
    return screenRegistry.has(`${navigatorId}:${name}`)
  }
  return getScreenNames().includes(name)
}

/**
 * Subscribe to registry changes
 * @returns Unsubscribe function
 */
export function subscribeToScreenRegistry(listener: RegistryListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notifyListeners(): void {
  listeners.forEach(l => l())
}

// Hash routing utilities

/**
 * Parse hash URL to route info
 * Format: #/screenName?param1=value1&param2=value2
 */
export function parseHash(hash: string): { screen: string; params: Record<string, string> } | null {
  if (!hash || !hash.startsWith('#/')) {
    return null
  }

  const withoutHash = hash.slice(2) // Remove '#/'
  const [screenPart, queryPart] = withoutHash.split('?')

  if (!screenPart) {
    return null
  }

  const params: Record<string, string> = {}
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart)
    searchParams.forEach((value, key) => {
      params[key] = value
    })
  }

  return { screen: screenPart, params }
}

/**
 * Build hash URL from route info
 */
export function buildHash(screen: string, params?: Record<string, unknown>): string {
  let hash = `#/${screen}`

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value))
      }
    })
    const query = searchParams.toString()
    if (query) {
      hash += `?${query}`
    }
  }

  return hash
}
