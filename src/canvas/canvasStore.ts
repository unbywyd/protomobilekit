/**
 * Canvas store for app visibility and fullscreen mode
 * Used by Canvas component and DevTools
 */

// State types
export interface CanvasState {
  /** Hidden app IDs */
  hiddenApps: Set<string>
  /** Currently fullscreen app ID (null = none) */
  fullscreenApp: string | null
}

// Store listeners
type Listener = () => void
const listeners = new Set<Listener>()

// Initial state - try to restore from localStorage
function getInitialState(): CanvasState {
  if (typeof window === 'undefined') {
    return { hiddenApps: new Set(), fullscreenApp: null }
  }

  try {
    const stored = localStorage.getItem('canvas-visibility')
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        hiddenApps: new Set(parsed.hiddenApps || []),
        fullscreenApp: parsed.fullscreenApp || null,
      }
    }
  } catch {
    // Ignore parse errors
  }

  return { hiddenApps: new Set(), fullscreenApp: null }
}

// State
let state: CanvasState = getInitialState()

// Persist to localStorage
function persist(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('canvas-visibility', JSON.stringify({
      hiddenApps: Array.from(state.hiddenApps),
      fullscreenApp: state.fullscreenApp,
    }))
  } catch {
    // Ignore storage errors
  }
}

// Notify listeners
function notify(): void {
  listeners.forEach(l => l())
}

/**
 * Get current canvas state
 */
export function getCanvasState(): CanvasState {
  return state
}

/**
 * Check if app is visible
 */
export function isAppVisible(appId: string): boolean {
  return !state.hiddenApps.has(appId)
}

/**
 * Check if app is in fullscreen mode
 */
export function isAppFullscreen(appId: string): boolean {
  return state.fullscreenApp === appId
}

/**
 * Check if any app is in fullscreen mode
 */
export function hasFullscreenApp(): boolean {
  return state.fullscreenApp !== null
}

/**
 * Toggle app visibility
 */
export function toggleAppVisibility(appId: string): void {
  const newHidden = new Set(state.hiddenApps)
  if (newHidden.has(appId)) {
    newHidden.delete(appId)
  } else {
    newHidden.add(appId)
    // If hiding fullscreen app, exit fullscreen
    if (state.fullscreenApp === appId) {
      state = { ...state, fullscreenApp: null }
    }
  }
  state = { ...state, hiddenApps: newHidden }
  persist()
  notify()
}

/**
 * Set app visibility
 */
export function setAppVisibility(appId: string, visible: boolean): void {
  const newHidden = new Set(state.hiddenApps)
  if (visible) {
    newHidden.delete(appId)
  } else {
    newHidden.add(appId)
    // If hiding fullscreen app, exit fullscreen
    if (state.fullscreenApp === appId) {
      state = { ...state, fullscreenApp: null }
    }
  }
  state = { ...state, hiddenApps: newHidden }
  persist()
  notify()
}

/**
 * Show all apps
 */
export function showAllApps(): void {
  state = { ...state, hiddenApps: new Set() }
  persist()
  notify()
}

/**
 * Enter fullscreen mode for an app
 */
export function enterFullscreen(appId: string): void {
  // Make sure app is visible
  const newHidden = new Set(state.hiddenApps)
  newHidden.delete(appId)
  state = { hiddenApps: newHidden, fullscreenApp: appId }
  persist()
  notify()
}

/**
 * Exit fullscreen mode
 */
export function exitFullscreen(): void {
  state = { ...state, fullscreenApp: null }
  persist()
  notify()
}

/**
 * Toggle fullscreen mode for an app
 */
export function toggleFullscreen(appId: string): void {
  if (state.fullscreenApp === appId) {
    exitFullscreen()
  } else {
    enterFullscreen(appId)
  }
}

/**
 * Subscribe to state changes
 * @returns Unsubscribe function
 */
export function subscribeCanvasState(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Reset canvas state
 */
export function resetCanvasState(): void {
  state = { hiddenApps: new Set(), fullscreenApp: null }
  persist()
  notify()
}
