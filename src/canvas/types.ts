import type { ReactNode } from 'react'

// Device frame types
export type DeviceType = 'iphone-14' | 'iphone-se' | 'pixel-7' | 'galaxy-s23' | 'ipad' | 'custom'

export interface DeviceConfig {
  name: string
  width: number
  height: number
  /** Scale factor for display */
  scale?: number
  /** Frame color */
  frameColor?: string
  /** Has notch */
  hasNotch?: boolean
  /** Border radius */
  borderRadius?: number
}

// Preset device configurations
// Using realistic mobile viewport widths (360-390px is standard)
export const DEVICE_PRESETS: Record<DeviceType, DeviceConfig> = {
  'iphone-14': {
    name: 'iPhone 14',
    width: 360,
    height: 780,
    hasNotch: true,
    borderRadius: 44,
  },
  'iphone-se': {
    name: 'iPhone SE',
    width: 360,
    height: 640,
    hasNotch: false,
    borderRadius: 20,
  },
  'pixel-7': {
    name: 'Pixel 7',
    width: 360,
    height: 800,
    hasNotch: false,
    borderRadius: 28,
  },
  'galaxy-s23': {
    name: 'Galaxy S23',
    width: 360,
    height: 780,
    hasNotch: false,
    borderRadius: 24,
  },
  'ipad': {
    name: 'iPad',
    width: 768,
    height: 1024,
    hasNotch: false,
    borderRadius: 18,
  },
  'custom': {
    name: 'Custom',
    width: 360,
    height: 780,
    hasNotch: false,
    borderRadius: 20,
  },
}

// App definition for canvas
export interface AppDefinition {
  id: string
  name: string
  icon?: string
  component: () => ReactNode
  /** Device type for this app */
  device?: DeviceType
  /** Custom device config */
  deviceConfig?: Partial<DeviceConfig>
}

// Canvas layout
export type CanvasLayout = 'row' | 'grid' | 'freeform'

export interface CanvasConfig {
  /** Apps to display */
  apps: AppDefinition[]
  /** Layout type */
  layout?: CanvasLayout
  /** Canvas background */
  background?: string
  /** Gap between apps */
  gap?: number
  /** Scale all devices */
  scale?: number
  /** Show device labels */
  showLabels?: boolean
}
