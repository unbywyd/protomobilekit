import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser, AuthState, AuthActions } from './types'

type AuthStore = AuthState & AuthActions

/**
 * Create a namespaced auth store
 * Each namespace gets its own isolated storage
 */
const stores = new Map<string, ReturnType<typeof createAuthStore>>()

// Track active namespaces for session overview
const activeNamespaces = new Set<string>()

// Session listeners for DevTools sync
const sessionListeners = new Set<() => void>()

function notifySessionListeners() {
  sessionListeners.forEach((listener) => listener())
}

function createAuthStore(namespace: string) {
  return create<AuthStore>()(
    persist(
      (set) => ({
        // State
        user: null,
        isAuthenticated: false,
        isLoading: false,

        // Actions
        login: (user: AuthUser) => {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        },

        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        },

        updateUser: (data: Partial<AuthUser>) => {
          set((state) => ({
            user: state.user ? { ...state.user, ...data } : null,
          }))
        },
      }),
      {
        name: `auth-${namespace}`,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
}

/**
 * Get or create auth store for namespace
 */
export function getAuthStore(namespace: string = 'default') {
  let store = stores.get(namespace)
  if (!store) {
    store = createAuthStore(namespace)
    stores.set(namespace, store)
    activeNamespaces.add(namespace)

    // Subscribe existing session listeners to new store
    for (const listener of sessionListeners) {
      store.subscribe(listener)
    }

    // Notify listeners about new namespace
    notifySessionListeners()
  }
  return store
}

/**
 * Get all active namespaces
 */
export function getActiveNamespaces(): string[] {
  return Array.from(activeNamespaces)
}

/**
 * Session info for DevTools
 */
export interface SessionInfo {
  namespace: string
  user: AuthUser | null
  isAuthenticated: boolean
}

/**
 * Get all active sessions
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
 * Reset auth for a specific namespace (useful for testing)
 */
export function resetAuth(namespace: string = 'default') {
  const store = stores.get(namespace)
  if (store) {
    store.getState().logout()
  }
}

/**
 * Reset all auth stores
 */
export function resetAllAuth() {
  for (const store of stores.values()) {
    store.getState().logout()
  }
}

/**
 * Subscribe to session changes across all namespaces
 */
export function subscribeToSessions(listener: () => void): () => void {
  sessionListeners.add(listener)

  // Subscribe to all existing stores
  const unsubscribes: Array<() => void> = []
  for (const store of stores.values()) {
    unsubscribes.push(store.subscribe(listener))
  }

  return () => {
    sessionListeners.delete(listener)
    unsubscribes.forEach((unsub) => unsub())
  }
}
