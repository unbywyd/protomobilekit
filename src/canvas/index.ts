// Components
export { Canvas, useApp, useAppContext, defineApp, type CanvasProps, type UseAppReturn } from './Canvas'
export { DeviceFrame, useSafeArea, useCanvasRoot, type DeviceFrameProps } from './DeviceFrame'

// Canvas state (visibility & fullscreen)
export {
  getCanvasState,
  isAppVisible,
  isAppFullscreen,
  hasFullscreenApp,
  toggleAppVisibility,
  setAppVisibility,
  showAllApps,
  enterFullscreen,
  exitFullscreen,
  toggleFullscreen,
  subscribeCanvasState,
  resetCanvasState,
  type CanvasState,
} from './canvasStore'
export { useCanvasState } from './useCanvasState'

// Apps registry
export { registerApps, unregisterApps, getRegisteredApps, subscribeAppsRegistry } from './appsRegistry'
export { useAppsRegistry } from './useAppsRegistry'

// Types
export type {
  DeviceType,
  DeviceConfig,
  AppDefinition,
  CanvasLayout,
  CanvasConfig,
} from './types'

// Presets
export { DEVICE_PRESETS } from './types'
