/**
 * Apps registry - allows DevTools to access the list of apps
 */

import type { AppDefinition } from './types'

// Registry state
let registeredApps: AppDefinition[] = []

// Listeners
type Listener = () => void
const listeners = new Set<Listener>()

function notify(): void {
  listeners.forEach(l => l())
}

/**
 * Register apps (called by Canvas)
 */
export function registerApps(apps: AppDefinition[]): void {
  registeredApps = apps
  notify()
}

/**
 * Unregister apps
 */
export function unregisterApps(): void {
  registeredApps = []
  notify()
}

/**
 * Get registered apps
 */
export function getRegisteredApps(): AppDefinition[] {
  return registeredApps
}

/**
 * Subscribe to apps registry changes
 */
export function subscribeAppsRegistry(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
