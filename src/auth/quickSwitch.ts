import { getAuthStore } from './store'
import { getTestUser } from './registry'
import type { AuthUser } from './types'

export interface QuickSwitchOptions {
  /** Skip emitting event (default: false) */
  silent?: boolean
}

/**
 * quickSwitch - Instantly switch to a predefined test user
 *
 * @example
 * ```tsx
 * // Switch to Alice in customer app
 * quickSwitch('customer', 'alice')
 *
 * // Silent switch (no event)
 * quickSwitch('customer', 'alice', { silent: true })
 * ```
 */
export function quickSwitch(
  appId: string,
  userId: string,
  options: QuickSwitchOptions = {}
): boolean {
  const testUser = getTestUser(appId, userId)

  if (!testUser) {
    console.warn(`[MobileKit] Test user not found: ${appId}/${userId}`)
    return false
  }

  const store = getAuthStore(appId)
  store.getState().login(testUser)

  // Log to console in development
  if (!options.silent) {
    console.log(`[MobileKit] Quick switch: ${appId} → ${testUser.name || userId}`)
  }

  return true
}

/**
 * quickLogout - Log out from a specific app namespace
 *
 * @example
 * ```tsx
 * quickLogout('customer')
 * ```
 */
export function quickLogout(appId: string): void {
  const store = getAuthStore(appId)
  store.getState().logout()
}

/**
 * SessionInfo - Information about an active session
 */
export interface SessionInfo {
  namespace: string
  user: AuthUser | null
  isAuthenticated: boolean
}

// Track active namespaces for session overview
const activeNamespaces = new Set<string>()

/**
 * Register a namespace as active (called internally by getAuthStore)
 */
export function registerNamespace(namespace: string): void {
  activeNamespaces.add(namespace)
}

/**
 * Get all active namespaces
 */
export function getActiveNamespaces(): string[] {
  return Array.from(activeNamespaces)
}

/**
 * getAllSessions - Get all active sessions across namespaces
 *
 * @example
 * ```tsx
 * const sessions = getAllSessions()
 * // [
 * //   { namespace: 'customer', user: { id: 'alice', ... }, isAuthenticated: true },
 * //   { namespace: 'courier', user: null, isAuthenticated: false },
 * // ]
 * ```
 */
export function getAllSessions(): SessionInfo[] {
  return getActiveNamespaces().map((namespace) => {
    const store = getAuthStore(namespace)
    const state = store.getState()
    return {
      namespace,
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    }
  })
}

/**
 * getSession - Get session for a specific namespace
 */
export function getSession(namespace: string): SessionInfo {
  const store = getAuthStore(namespace)
  const state = store.getState()
  return {
    namespace,
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }
}
