/**
 * Canvas SDK - Programmatic API for controlling Canvas
 *
 * Usage:
 * import { canvas } from 'protomobilekit'
 *
 * // Get all apps
 * const apps = canvas.getApps()
 *
 * // Get specific app
 * const app = canvas.getApp('customer')
 *
 * // Visibility control
 * canvas.show('customer')
 * canvas.hide('admin')
 * canvas.toggle('courier')
 * canvas.showAll()
 * canvas.showOnly('customer') // Hide all except one
 *
 * // Fullscreen control
 * canvas.fullscreen('customer')
 * canvas.exitFullscreen()
 * canvas.toggleFullscreen('customer')
 *
 * // State queries
 * canvas.isVisible('customer')
 * canvas.isFullscreen('customer')
 * canvas.getVisibleApps()
 * canvas.getFullscreenApp()
 *
 * // Navigation (for MCP/automation)
 * canvas.navigateTo('admin', 'orders')
 * canvas.navigateTo('admin', 'orderDetails', { id: 'o1' })
 * canvas.getCurrentRoute()
 *
 * // Subscribe to changes
 * const unsubscribe = canvas.subscribe(() => {
 *   console.log('Canvas state changed')
 * })
 */

import type { AppDefinition } from './types'
import type { ScreenRegistryEntry } from '../navigation/types'
import { getRegisteredApps, subscribeAppsRegistry } from './appsRegistry'
import {
  getCanvasState,
  isAppVisible,
  isAppFullscreen,
  hasFullscreenApp,
  setAppVisibility,
  toggleAppVisibility,
  showAllApps,
  enterFullscreen,
  exitFullscreen,
  toggleFullscreen,
  subscribeCanvasState,
  resetCanvasState,
} from './canvasStore'
import { getScreens, parseHash, buildHash } from '../navigation/registry'

export interface CanvasSDK {
  // Apps
  /** Get all registered apps */
  getApps(): AppDefinition[]
  /** Get app by ID */
  getApp(appId: string): AppDefinition | undefined
  /** Get visible apps */
  getVisibleApps(): AppDefinition[]
  /** Get hidden apps */
  getHiddenApps(): AppDefinition[]

  // Visibility
  /** Show app */
  show(appId: string): void
  /** Hide app */
  hide(appId: string): void
  /** Toggle app visibility */
  toggle(appId: string): void
  /** Show all apps */
  showAll(): void
  /** Show only specified app (hide all others) */
  showOnly(appId: string): void
  /** Check if app is visible */
  isVisible(appId: string): boolean

  // Fullscreen
  /** Enter fullscreen mode for app */
  fullscreen(appId: string): void
  /** Exit fullscreen mode */
  exitFullscreen(): void
  /** Toggle fullscreen mode for app */
  toggleFullscreen(appId: string): void
  /** Check if app is in fullscreen mode */
  isFullscreen(appId: string): boolean
  /** Check if any app is in fullscreen mode */
  hasFullscreen(): boolean
  /** Get fullscreen app (or null) */
  getFullscreenApp(): AppDefinition | null

  // Subscription
  /** Subscribe to canvas state changes */
  subscribe(listener: () => void): () => void
  /** Subscribe to apps registry changes */
  subscribeApps(listener: () => void): () => void

  // Reset
  /** Reset canvas state (show all, exit fullscreen) */
  reset(): void

  // Navigation (for MCP/automation)
  /** Navigate to a specific screen in an app */
  navigateTo(appId: string, screenName?: string, params?: Record<string, unknown>): void
  /** Get current route from hash */
  getCurrentRoute(): { appId: string; screen: string; params: Record<string, string> } | null
  /** Get all screens for an app */
  getScreens(appId: string): ScreenRegistryEntry[]
  /** Get all screen names for an app */
  getScreenNames(appId: string): string[]
}

/**
 * Canvas SDK instance
 */
export const canvas: CanvasSDK = {
  // Apps
  getApps() {
    return getRegisteredApps()
  },

  getApp(appId: string) {
    return getRegisteredApps().find(app => app.id === appId)
  },

  getVisibleApps() {
    const apps = getRegisteredApps()
    return apps.filter(app => isAppVisible(app.id))
  },

  getHiddenApps() {
    const apps = getRegisteredApps()
    return apps.filter(app => !isAppVisible(app.id))
  },

  // Visibility
  show(appId: string) {
    setAppVisibility(appId, true)
  },

  hide(appId: string) {
    setAppVisibility(appId, false)
  },

  toggle(appId: string) {
    toggleAppVisibility(appId)
  },

  showAll() {
    showAllApps()
  },

  showOnly(appId: string) {
    const apps = getRegisteredApps()
    apps.forEach(app => {
      setAppVisibility(app.id, app.id === appId)
    })
  },

  isVisible(appId: string) {
    return isAppVisible(appId)
  },

  // Fullscreen
  fullscreen(appId: string) {
    enterFullscreen(appId)
  },

  exitFullscreen() {
    exitFullscreen()
  },

  toggleFullscreen(appId: string) {
    toggleFullscreen(appId)
  },

  isFullscreen(appId: string) {
    return isAppFullscreen(appId)
  },

  hasFullscreen() {
    return hasFullscreenApp()
  },

  getFullscreenApp() {
    const state = getCanvasState()
    if (!state.fullscreenApp) return null
    return getRegisteredApps().find(app => app.id === state.fullscreenApp) || null
  },

  // Subscription
  subscribe(listener: () => void) {
    return subscribeCanvasState(listener)
  },

  subscribeApps(listener: () => void) {
    return subscribeAppsRegistry(listener)
  },

  // Reset
  reset() {
    resetCanvasState()
  },

  // Navigation (for MCP/automation)
  navigateTo(appId: string, screenName?: string, params?: Record<string, unknown>) {
    // Enter fullscreen for this app
    enterFullscreen(appId)

    // Build and set hash for navigation
    if (screenName) {
      const hash = buildHash(`${appId}/${screenName}`, params)
      if (typeof window !== 'undefined') {
        window.location.hash = hash.slice(1) // Remove leading #
      }
    } else {
      // Just navigate to app root
      if (typeof window !== 'undefined') {
        window.location.hash = appId
      }
    }
  },

  getCurrentRoute() {
    if (typeof window === 'undefined') return null

    const hash = window.location.hash
    if (!hash) return null

    // Parse format: #appId/screenName?params or #/appId/screenName?params
    const cleanHash = hash.startsWith('#/') ? hash : `#/${hash.slice(1)}`
    const parsed = parseHash(cleanHash)

    if (!parsed) return null

    // Split screen into appId and screenName
    const parts = parsed.screen.split('/')
    if (parts.length === 0) return null

    const appId = parts[0]
    const screen = parts.slice(1).join('/') || 'home'

    return { appId, screen, params: parsed.params }
  },

  getScreens(appId: string) {
    return getScreens(appId)
  },

  getScreenNames(appId: string) {
    return getScreens(appId).map(s => s.name)
  },
}

// Expose SDK globally for MCP/Puppeteer automation
if (typeof window !== 'undefined') {
  (window as unknown as { __CANVAS_SDK__: CanvasSDK }).__CANVAS_SDK__ = canvas
}
