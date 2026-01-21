import { useSyncExternalStore } from 'react'
import {
  getCanvasState,
  subscribeCanvasState,
  isAppVisible,
  isAppFullscreen,
  hasFullscreenApp,
  toggleAppVisibility,
  setAppVisibility,
  showAllApps,
  enterFullscreen,
  exitFullscreen,
  toggleFullscreen,
  resetCanvasState,
  type CanvasState,
} from './canvasStore'

/**
 * Hook to access canvas state reactively
 */
export function useCanvasState(): CanvasState & {
  isAppVisible: (appId: string) => boolean
  isAppFullscreen: (appId: string) => boolean
  hasFullscreenApp: () => boolean
  toggleAppVisibility: (appId: string) => void
  setAppVisibility: (appId: string, visible: boolean) => void
  showAllApps: () => void
  enterFullscreen: (appId: string) => void
  exitFullscreen: () => void
  toggleFullscreen: (appId: string) => void
  resetCanvasState: () => void
} {
  const state = useSyncExternalStore(
    subscribeCanvasState,
    getCanvasState,
    getCanvasState
  )

  return {
    ...state,
    isAppVisible,
    isAppFullscreen,
    hasFullscreenApp,
    toggleAppVisibility,
    setAppVisibility,
    showAllApps,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    resetCanvasState,
  }
}
