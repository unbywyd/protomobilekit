import { useCallback, useMemo } from 'react'
import { getAuthStore } from './store'
import { useAppContext } from '../canvas/Canvas'
import type { AuthUser, UseAuthOptions, UseAuthReturn } from './types'

/**
 * useAuth - Authentication hook with namespace isolation
 *
 * Each app can have its own auth state by using different namespaces.
 * When used inside Canvas, automatically uses the app's ID as namespace.
 *
 * @example
 * ```tsx
 * // Inside Canvas - auto-namespaced by app ID
 * function CustomerApp() {
 *   const { user, login, logout } = useAuth()
 *   // Uses 'customer' namespace automatically
 * }
 *
 * // Explicit namespace
 * function CourierLogin() {
 *   const { login } = useAuth({ namespace: 'courier' })
 * }
 *
 * // Check authentication
 * function ProfileScreen() {
 *   const { user, isAuthenticated, logout } = useAuth()
 *
 *   if (!isAuthenticated) {
 *     return <LoginScreen />
 *   }
 *
 *   return <Profile user={user} onLogout={logout} />
 * }
 * ```
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  // Try to get app context for auto-namespacing
  const appContext = useAppContext()

  // Use provided namespace, or app ID from context, or 'default'
  const namespace = options.namespace ?? appContext?.appId ?? 'default'

  // Get the store for this namespace
  const store = useMemo(() => getAuthStore(namespace), [namespace])

  // Subscribe to store changes
  const user = store((s) => s.user)
  const isAuthenticated = store((s) => s.isAuthenticated)
  const isLoading = store((s) => s.isLoading)

  // Memoized actions
  const login = useCallback(
    (userData: AuthUser) => {
      store.getState().login(userData)
    },
    [store]
  )

  const logout = useCallback(() => {
    store.getState().logout()
  }, [store])

  const updateUser = useCallback(
    (data: Partial<AuthUser>) => {
      store.getState().updateUser(data)
    },
    [store]
  )

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  }
}

/**
 * useUser - Get current user (shorthand)
 *
 * @example
 * ```tsx
 * function Avatar() {
 *   const user = useUser()
 *   return <img src={user?.avatar} />
 * }
 * ```
 */
export function useUser(options: UseAuthOptions = {}): AuthUser | null {
  const { user } = useAuth(options)
  return user
}

/**
 * useIsAuthenticated - Check if user is authenticated
 *
 * @example
 * ```tsx
 * function Header() {
 *   const isAuthenticated = useIsAuthenticated()
 *   return isAuthenticated ? <UserMenu /> : <LoginButton />
 * }
 * ```
 */
export function useIsAuthenticated(options: UseAuthOptions = {}): boolean {
  const { isAuthenticated } = useAuth(options)
  return isAuthenticated
}

/**
 * useCurrentUserId - Get current user ID for entity operations
 *
 * @example
 * ```tsx
 * function CreateOrder() {
 *   const userId = useCurrentUserId()
 *   const { create } = useRepo('Order')
 *
 *   const handleOrder = () => {
 *     create({ customerId: userId, ... })
 *   }
 * }
 * ```
 */
export function useCurrentUserId(options: UseAuthOptions = {}): string | null {
  const { user } = useAuth(options)
  return user?.id ?? null
}

/**
 * useRequireAuth - Hook that requires authentication
 *
 * Returns auth state with guaranteed user (throws if not authenticated).
 * Useful for screens that should only be accessible when logged in.
 *
 * @example
 * ```tsx
 * function ProfileScreen() {
 *   const { user, logout } = useRequireAuth()
 *   // user is guaranteed to exist here
 *   return <Text>{user.name}</Text>
 * }
 * ```
 */
export function useRequireAuth(options: UseAuthOptions = {}): UseAuthReturn & { user: AuthUser } {
  const auth = useAuth(options)

  if (!auth.isAuthenticated || !auth.user) {
    throw new Error(
      `[MobileKit] useRequireAuth: Authentication required. ` +
        `Namespace: ${options.namespace ?? 'auto'}`
    )
  }

  return auth as UseAuthReturn & { user: AuthUser }
}
