import React from 'react'

// Screen component registry - stores actual components
interface ScreenEntry {
  name: string
  component: React.ComponentType<any>
  navigatorId: string
  appId?: string
}

const componentRegistry = new Map<string, ScreenEntry>()

/**
 * Register a screen component for preview mode
 * @internal Called by Navigator when screens are registered
 */
export function registerScreenComponent(
  name: string,
  component: React.ComponentType<any>,
  navigatorId: string,
  appId?: string
): void {
  const key = appId ? `${appId}:${navigatorId}:${name}` : `${navigatorId}:${name}`
  componentRegistry.set(key, { name, component, navigatorId, appId })
}

/**
 * Unregister screen components for a navigator
 * @internal Called by Navigator on unmount
 */
export function unregisterScreenComponents(navigatorId: string, appId?: string): void {
  const prefix = appId ? `${appId}:${navigatorId}:` : `${navigatorId}:`
  for (const key of componentRegistry.keys()) {
    if (key.startsWith(prefix)) {
      componentRegistry.delete(key)
    }
  }
}

/**
 * Get a screen component by name
 */
export function getScreenComponent(
  screenName: string,
  navigatorId: string = 'main',
  appId?: string
): React.ComponentType<any> | null {
  // Try with appId first
  if (appId) {
    const entry = componentRegistry.get(`${appId}:${navigatorId}:${screenName}`)
    if (entry) return entry.component
  }

  // Try without appId
  const entry = componentRegistry.get(`${navigatorId}:${screenName}`)
  if (entry) return entry.component

  // Search all entries for matching screen name
  for (const entry of componentRegistry.values()) {
    if (entry.name === screenName) {
      return entry.component
    }
  }

  return null
}

/**
 * Get all registered screen names
 */
export function getRegisteredScreenNames(appId?: string): string[] {
  const names = new Set<string>()
  for (const entry of componentRegistry.values()) {
    if (!appId || entry.appId === appId) {
      names.add(entry.name)
    }
  }
  return Array.from(names)
}

/**
 * Parse preview params from URL search params
 */
export function parsePreviewParams(search: string): {
  isPreview: boolean
  screenId?: string
  userId?: string
  appId?: string
  navigatorId?: string
} {
  const params = new URLSearchParams(search)
  const mode = params.get('mode')

  if (mode !== 'preview') {
    return { isPreview: false }
  }

  return {
    isPreview: true,
    screenId: params.get('screen') || undefined,
    userId: params.get('user') || undefined,
    appId: params.get('app') || undefined,
    navigatorId: params.get('navigator') || 'main',
  }
}

/**
 * Hook to get preview mode state from URL
 *
 * @example
 * ```tsx
 * // URL: /prototype?mode=preview&screen=home&user=user-1
 *
 * function App() {
 *   const { isPreview, screenId, userId } = usePreviewMode()
 *
 *   if (isPreview && screenId) {
 *     return <ScreenPreview screen={screenId} user={userId} />
 *   }
 *
 *   return <Canvas apps={apps} />
 * }
 * ```
 */
export function usePreviewMode() {
  const [state, setState] = React.useState(() => {
    if (typeof window === 'undefined') {
      return { isPreview: false }
    }
    return parsePreviewParams(window.location.search)
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePopState = () => {
      setState(parsePreviewParams(window.location.search))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return state
}

export { ScreenPreview, type ScreenPreviewProps } from './ScreenPreview'
export { MockAuthProvider, useMockAuth, useIsMockAuth, type MockAuthProviderProps } from './MockAuthProvider'
