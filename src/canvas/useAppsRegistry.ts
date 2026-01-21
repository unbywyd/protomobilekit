import { useSyncExternalStore } from 'react'
import { getRegisteredApps, subscribeAppsRegistry } from './appsRegistry'
import type { AppDefinition } from './types'

/**
 * Hook to get registered apps reactively
 */
export function useAppsRegistry(): AppDefinition[] {
  return useSyncExternalStore(
    subscribeAppsRegistry,
    getRegisteredApps,
    getRegisteredApps
  )
}
