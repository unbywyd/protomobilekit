import type { AppFrames, Frame, FrameNavigationRequest, FrameDefinitionInput, FrameNavigationActions, FrameInput } from './types'
import { registerScreen } from '../canvas/screenRegistry'

/**
 * Frame Registry - Central store for all app frames
 *
 * Allows registering frames from multiple apps and provides
 * a unified view for the Frame Browser DevTool
 */

// Internal state
const registry = new Map<string, AppFrames>()
const listeners = new Set<() => void>()
const navigators = new Map<string, FrameNavigationActions>()

// Navigation callback (set by Canvas/DevTools)
let navigationCallback: ((request: FrameNavigationRequest) => void) | null = null

/**
 * Register frames for an app
 */
export function registerFrames(appId: string, appName: string, frames: Frame[], initial: string): void {
  registry.set(appId, { appId, appName, frames, initial })
  notifyListeners()
}

/**
 * Unregister an app's frames
 */
export function unregisterFrames(appId: string): void {
  registry.delete(appId)
  notifyListeners()
}

/**
 * Get all registered apps with frames
 */
export function getAllApps(): AppFrames[] {
  return Array.from(registry.values())
}

/**
 * Get frames for a specific app
 */
export function getAppFrames(appId: string): AppFrames | undefined {
  return registry.get(appId)
}

/**
 * Get a specific frame
 */
export function getFrame(appId: string, frameId: string): Frame | undefined {
  const app = registry.get(appId)
  return app?.frames.find(f => f.id === frameId)
}

/**
 * Get total frame count
 */
export function getFrameCount(): number {
  let count = 0
  for (const app of registry.values()) {
    count += app.frames.length
  }
  return count
}

/**
 * Search frames by name or description
 */
export function searchFrames(query: string): Array<{ app: AppFrames; frame: Frame }> {
  const results: Array<{ app: AppFrames; frame: Frame }> = []
  const lowerQuery = query.toLowerCase()

  for (const app of registry.values()) {
    for (const frame of app.frames) {
      const matchesName = frame.name.toLowerCase().includes(lowerQuery)
      const matchesDesc = frame.description?.toLowerCase().includes(lowerQuery)
      const matchesTags = frame.tags?.some(t => t.toLowerCase().includes(lowerQuery))

      if (matchesName || matchesDesc || matchesTags) {
        results.push({ app, frame })
      }
    }
  }

  return results
}

/**
 * Set navigation callback (called when user clicks a frame in browser)
 */
export function setNavigationCallback(callback: (request: FrameNavigationRequest) => void): void {
  navigationCallback = callback
}

/**
 * Navigate to a specific frame using traditional navigation
 * If frame has onNavigate handler - calls it with navigator
 * Otherwise resets navigator to that frame
 *
 * NOTE: For direct screen rendering (bypassing app component),
 * use setDirectScreen() from canvas/screenRegistry instead.
 * This function is kept for backward compatibility with onNavigate handlers.
 */
export function navigateToFrame(appId: string, frameId: string): void {
  const frame = getFrame(appId, frameId)
  const nav = navigators.get(appId)

  if (frame && nav) {
    if (frame.onNavigate) {
      // Custom navigation handler
      frame.onNavigate(nav)
    } else {
      // Default: reset to this frame
      nav.reset(frameId)
    }
  }

  // Also notify callback if set (for DevTools logging etc)
  if (navigationCallback) {
    navigationCallback({ appId, frameId })
  }
}

/**
 * Register navigator for an app (called by Navigator on mount)
 */
export function registerNavigator(appId: string, actions: FrameNavigationActions): void {
  navigators.set(appId, actions)
}

/**
 * Unregister navigator (called by Navigator on unmount)
 */
export function unregisterNavigator(appId: string): void {
  navigators.delete(appId)
}

/**
 * Subscribe to registry changes
 */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Clear all registered frames (for testing)
 */
export function clearRegistry(): void {
  registry.clear()
  notifyListeners()
}

/**
 * Create a reusable frame object
 *
 * Use this to create frame objects that can be used in both defineFrames and defineFlow.
 * This provides a single source of truth for frame definitions.
 *
 * @example
 * ```tsx
 * const homeFrame = createFrame({
 *   id: 'home',
 *   name: '1.1 Home',
 *   description: 'Restaurant list with search',
 *   component: HomeScreen,
 *   tags: ['main'],
 * })
 *
 * // Use in defineFrames
 * defineFrames({
 *   appId: 'customer',
 *   frames: [homeFrame, menuFrame, ...]
 * })
 *
 * // Use in defineFlow
 * defineFlow({
 *   id: 'order-flow',
 *   steps: [{ frame: homeFrame, tasks: ['Find restaurant'] }]
 * })
 * ```
 */
export function createFrame(input: FrameInput): Frame {
  return {
    id: input.id,
    name: input.name,
    description: input.description,
    component: input.component,
    tags: input.tags,
    params: input.params,
    onNavigate: input.onNavigate,
  }
}

/**
 * Define frames for an app - helper that registers and returns the definition
 *
 * Also registers each frame's component in the unified screenRegistry so that
 * DirectScreenRenderer can find and render them directly (bypassing app component).
 *
 * @example
 * ```tsx
 * const CustomerFrames = defineFrames({
 *   appId: 'customer',
 *   appName: 'Customer App',
 *   initial: 'home',
 *   frames: [
 *     { id: 'home', name: '1.1 Home', description: 'Restaurant list', component: HomeScreen },
 *     { id: 'menu', name: '1.2 Menu', description: 'Restaurant menu', component: MenuScreen },
 *   ]
 * })
 * ```
 */
export function defineFrames(input: FrameDefinitionInput): FrameDefinitionInput {
  registerFrames(input.appId, input.appName, input.frames, input.initial)

  // Also register each frame in the unified screenRegistry for direct rendering
  // (only if component is provided - screens via defineScreen are already registered)
  for (const frame of input.frames) {
    if (frame.component) {
      registerScreen({
        name: frame.id,
        component: frame.component,
        appId: input.appId,
        navigatorId: 'frames', // Special navigator ID for frame-registered screens
        label: frame.name,
        description: frame.description,
        tags: frame.tags,
      })
    }
  }

  return input
}

// Internal: notify all listeners
function notifyListeners(): void {
  for (const listener of listeners) {
    listener()
  }
}
