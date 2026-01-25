import React, { createContext, useContext, useMemo } from 'react'
import type { AuthUser } from '../auth/types'
import { getTestUser, getAppUsers } from '../auth/registry'

interface MockAuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: AuthUser) => void
  logout: () => void
  updateUser: (data: Partial<AuthUser>) => void
}

const MockAuthContext = createContext<MockAuthContextValue | null>(null)

export interface MockAuthProviderProps {
  children: React.ReactNode
  /** User ID from test users registry */
  userId?: string
  /** App ID to get test user from */
  appId?: string
  /** Or provide user object directly */
  user?: AuthUser | null
  /** Force authenticated state (default: true if user provided) */
  isAuthenticated?: boolean
}

/**
 * MockAuthProvider - Provides mock auth state for preview mode
 *
 * Wraps components to provide fake auth context without real login flow.
 * Useful for screenshots and isolated component testing.
 *
 * @example
 * ```tsx
 * // Using test user from registry
 * <MockAuthProvider appId="myapp" userId="user-1">
 *   <ProfileScreen />
 * </MockAuthProvider>
 *
 * // Using direct user object
 * <MockAuthProvider user={{ id: '1', name: 'Test User', phone: '+123' }}>
 *   <ProfileScreen />
 * </MockAuthProvider>
 *
 * // Unauthenticated state
 * <MockAuthProvider isAuthenticated={false}>
 *   <LoginScreen />
 * </MockAuthProvider>
 * ```
 */
export function MockAuthProvider({
  children,
  userId,
  appId,
  user: directUser,
  isAuthenticated: forceAuth,
}: MockAuthProviderProps) {
  const resolvedUser = useMemo(() => {
    // Direct user takes priority
    if (directUser !== undefined) {
      return directUser
    }

    // Try to get user from registry
    if (userId && appId) {
      return getTestUser(appId, userId) || null
    }

    // Try first user from app
    if (appId) {
      const users = getAppUsers(appId)
      if (users.length > 0) {
        return userId ? users.find(u => u.id === userId) || users[0] : users[0]
      }
    }

    return null
  }, [directUser, userId, appId])

  const isAuthenticated = forceAuth !== undefined
    ? forceAuth
    : resolvedUser !== null

  const contextValue = useMemo<MockAuthContextValue>(() => ({
    user: resolvedUser,
    isAuthenticated,
    isLoading: false,
    // No-op functions for preview mode
    login: () => {},
    logout: () => {},
    updateUser: () => {},
  }), [resolvedUser, isAuthenticated])

  return (
    <MockAuthContext.Provider value={contextValue}>
      {children}
    </MockAuthContext.Provider>
  )
}

/**
 * Hook to use mock auth context
 * Falls back to real auth if not in MockAuthProvider
 */
export function useMockAuth(): MockAuthContextValue | null {
  return useContext(MockAuthContext)
}

/**
 * Check if we're inside MockAuthProvider
 */
export function useIsMockAuth(): boolean {
  return useContext(MockAuthContext) !== null
}

MockAuthProvider.displayName = 'MockAuthProvider'
