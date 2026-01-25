/**
 * Unified Screen Registry
 *
 * Single source of truth for all screens across all apps.
 * Navigator.Screen registers here, Canvas/DevTools read from here.
 */

import type { ComponentType } from 'react'
import type {
  ScreenConfig,
  ParamsResolver,
  ParamsCodec,
  ViewModel,
} from '../screens/types'

// Screen entry with component and metadata
export interface ScreenEntry {
  /** Screen name (used in Navigator) */
  name: string
  /** Screen component (legacy) */
  component: ComponentType<any>
  /** App ID */
  appId: string
  /** Navigator ID */
  navigatorId: string
  /** Display label for DevTools */
  label?: string
  /** Description for DevTools */
  description?: string
  /** Tags for filtering */
  tags?: string[]

  // ============================================
  // v2 Screen Architecture fields
  // ============================================

  /** v2: View component (only renders VM) */
  View?: ComponentType<{ vm: any }>
  /** v2: useCase hook (params → ViewModel) */
  useCase?: (params: any) => any
  /** v2: Params resolver (given → Result<full params>) */
  resolveParams?: ParamsResolver<any>
  /** v2: Params codec for URL coercion */
  paramsCodec?: ParamsCodec<any>
}

// Direct screen render state
export interface DirectScreen {
  appId: string
  screen: string
  params?: Record<string, unknown>
  userId?: string
}

// Internal state
const screenRegistry = new Map<string, ScreenEntry>()
const listeners = new Set<() => void>()

// Direct screen state (which screen to render directly, bypassing app)
let directScreen: DirectScreen | null = null
const directScreenListeners = new Set<() => void>()

// Build registry key
function buildKey(appId: string, navigatorId: string, name: string): string {
  return `${appId}:${navigatorId}:${name}`
}

/**
 * Register a screen component
 * Called by Navigator when screens mount
 *
 * Note: Does NOT overwrite v2 screens (those registered via defineScreen)
 */
export function registerScreen(entry: ScreenEntry): void {
  const key = buildKey(entry.appId, entry.navigatorId, entry.name)

  // Don't overwrite v2 screens
  const existing = screenRegistry.get(key)
  if (existing && isV2Screen(existing)) {
    return
  }

  screenRegistry.set(key, entry)
  notifyListeners()
}

/**
 * Unregister screens for a navigator
 * Called by Navigator on unmount
 */
export function unregisterNavigatorScreens(appId: string, navigatorId: string): void {
  const prefix = `${appId}:${navigatorId}:`
  for (const key of screenRegistry.keys()) {
    if (key.startsWith(prefix)) {
      screenRegistry.delete(key)
    }
  }
  notifyListeners()
}

/**
 * Get screen component by name
 */
export function getScreen(appId: string, screenName: string, navigatorId: string = 'main'): ScreenEntry | null {
  // Try exact match first
  const exactKey = buildKey(appId, navigatorId, screenName)
  const exact = screenRegistry.get(exactKey)
  if (exact) return exact

  // Search all navigators for this app
  for (const [key, entry] of screenRegistry.entries()) {
    if (entry.appId === appId && entry.name === screenName) {
      return entry
    }
  }

  return null
}

/**
 * Get all screens for an app
 */
export function getAppScreens(appId: string): ScreenEntry[] {
  const screens: ScreenEntry[] = []
  for (const entry of screenRegistry.values()) {
    if (entry.appId === appId) {
      screens.push(entry)
    }
  }
  return screens
}

/**
 * Get all registered apps with their screens
 */
export function getAllAppScreens(): Map<string, ScreenEntry[]> {
  const byApp = new Map<string, ScreenEntry[]>()
  for (const entry of screenRegistry.values()) {
    const list = byApp.get(entry.appId) || []
    list.push(entry)
    byApp.set(entry.appId, list)
  }
  return byApp
}

/**
 * Get all screen names for an app
 */
export function getScreenNames(appId: string): string[] {
  const names = new Set<string>()
  for (const entry of screenRegistry.values()) {
    if (entry.appId === appId) {
      names.add(entry.name)
    }
  }
  return Array.from(names)
}

/**
 * Subscribe to registry changes
 */
export function subscribeScreenRegistry(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notifyListeners(): void {
  listeners.forEach(l => l())
}

// ============================================
// Direct Screen API (for DevTools, URL, etc.)
// ============================================

/**
 * Set direct screen to render (bypasses app component)
 */
export function setDirectScreen(screen: DirectScreen | null): void {
  directScreen = screen
  notifyDirectScreenListeners()
}

/**
 * Get current direct screen
 */
export function getDirectScreen(): DirectScreen | null {
  return directScreen
}

/**
 * Clear direct screen (return to normal app rendering)
 */
export function clearDirectScreen(): void {
  directScreen = null
  notifyDirectScreenListeners()
}

/**
 * Subscribe to direct screen changes
 */
export function subscribeDirectScreen(listener: () => void): () => void {
  directScreenListeners.add(listener)
  return () => directScreenListeners.delete(listener)
}

function notifyDirectScreenListeners(): void {
  directScreenListeners.forEach(l => l())
}

/**
 * Parse URL for direct screen parameters
 * URL format: ?screen=appId:screenName&user=userId&params=json
 */
export function parseDirectScreenFromURL(): DirectScreen | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const screenParam = params.get('screen')

  if (!screenParam) return null

  // Parse appId:screenName format
  const [appId, screen] = screenParam.includes(':')
    ? screenParam.split(':')
    : [undefined, screenParam]

  if (!screen) return null

  const result: DirectScreen = {
    appId: appId || '',
    screen,
  }

  // Optional user
  const userId = params.get('user')
  if (userId) result.userId = userId

  // Optional params (JSON)
  const paramsJson = params.get('params')
  if (paramsJson) {
    try {
      result.params = JSON.parse(paramsJson)
    } catch {
      // Ignore parse errors
    }
  }

  return result
}

/**
 * Build URL for direct screen
 */
export function buildDirectScreenURL(screen: DirectScreen): string {
  const params = new URLSearchParams()
  params.set('screen', screen.appId ? `${screen.appId}:${screen.screen}` : screen.screen)
  if (screen.userId) params.set('user', screen.userId)
  if (screen.params) params.set('params', JSON.stringify(screen.params))
  return `?${params.toString()}`
}

// ============================================
// v2 Screen Architecture API
// ============================================

/**
 * Check if screen entry is v2 (has View + useCase)
 */
export function isV2Screen(entry: ScreenEntry): boolean {
  return !!(entry.View && entry.useCase)
}

/**
 * Register a v2 screen
 * @example
 * registerScreenV2({
 *   appId: 'customer',
 *   name: 'restaurant',
 *   View: RestaurantView,
 *   useCase: useRestaurantCase,
 *   resolveParams: resolveRestaurantParams,
 * })
 */
export function registerScreenV2<P, VM extends ViewModel>(
  config: ScreenConfig<P, VM>
): void {
  const navigatorId = config.navigatorId ?? 'main'
  const key = buildKey(config.appId, navigatorId, config.name)

  screenRegistry.set(key, {
    name: config.name,
    appId: config.appId,
    navigatorId,
    // Legacy component - not used for v2, but required for type
    component: () => null,

    // v2 fields
    View: config.View as ComponentType<{ vm: any }>,
    useCase: config.useCase as (params: any) => any,
    resolveParams: config.resolveParams as ParamsResolver<any> | undefined,
    paramsCodec: config.paramsCodec as ParamsCodec<any> | undefined,
    tags: config.tags,
    description: config.description,
  })

  notifyListeners()
}

// defineScreen is re-exported from ../screens/defineScreen.tsx to avoid circular deps
export { defineScreen } from '../screens/defineScreen'
