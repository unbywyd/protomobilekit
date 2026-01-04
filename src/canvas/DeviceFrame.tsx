import React, { createContext, useContext, useState, useEffect } from 'react'
import { cn } from '../ui/utils'
import type { DeviceConfig, DeviceType } from './types'
import { DEVICE_PRESETS } from './types'

// Safe area context for notch/home indicator insets
interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

const SafeAreaContext = createContext<SafeAreaInsets>({ top: 0, bottom: 0, left: 0, right: 0 })

export function useSafeArea() {
  return useContext(SafeAreaContext)
}

// Canvas root context for portal rendering
const CanvasRootContext = createContext<HTMLElement | null>(null)

export function useCanvasRoot(): HTMLElement | null {
  return useContext(CanvasRootContext)
}

export interface DeviceFrameProps {
  children: React.ReactNode
  /** Device type preset */
  device?: DeviceType
  /** Custom device config (overrides preset) */
  config?: Partial<DeviceConfig>
  /** Scale factor */
  scale?: number
  /** Show device label */
  showLabel?: boolean
  /** Custom label */
  label?: string
  className?: string
}

/**
 * DeviceFrame - Mobile device frame wrapper
 */
export function DeviceFrame({
  children,
  device = 'iphone-14',
  config,
  scale = 1,
  showLabel = false,
  label,
  className,
}: DeviceFrameProps) {
  const preset = DEVICE_PRESETS[device]
  const deviceConfig: DeviceConfig = {
    ...preset,
    ...config,
  }

  const { width, height, borderRadius, hasNotch, frameColor = '#1f2937' } = deviceConfig
  const displayLabel = label || deviceConfig.name
  const [canvasRoot, setCanvasRoot] = React.useState<HTMLElement | null>(null)

  // Safe area insets for notch devices
  const safeAreaInsets: SafeAreaInsets = {
    top: hasNotch ? 47 : 20,    // Status bar + notch
    bottom: hasNotch ? 34 : 0,  // Home indicator
    left: 0,
    right: 0,
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Device frame */}
      <div
        className="relative bg-gray-900 shadow-2xl"
        style={{
          width: width * scale + 24,
          height: height * scale + 24,
          borderRadius: (borderRadius || 20) * scale + 8,
          backgroundColor: frameColor,
          padding: 12 * scale,
        }}
      >
        {/* Screen bezel */}
        <div
          className="relative bg-black overflow-hidden"
          style={{
            width: width * scale,
            height: height * scale,
            borderRadius: (borderRadius || 20) * scale,
          }}
        >
          {/* Notch - rendered on TOP of content with high z-index */}
          {hasNotch && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 bg-black z-50 pointer-events-none"
              style={{
                width: 150 * scale,
                height: 34 * scale,
                borderBottomLeftRadius: 20 * scale,
                borderBottomRightRadius: 20 * scale,
              }}
            />
          )}

          {/* Screen content with safe area provider */}
          <div
            ref={(el) => {
              // Store the canvas root element in state and context
              if (el) {
                setCanvasRoot(el)
              }
            }}
            className="absolute inset-0 bg-white overflow-hidden"
            style={{
              width: width * scale,
              height: height * scale,
              fontSize: '14px',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              overflowX: 'hidden',
              overflowY: 'hidden',
            }}
          >
            <SafeAreaContext.Provider value={safeAreaInsets}>
              <CanvasRootContext.Provider value={canvasRoot}>
                {children}
              </CanvasRootContext.Provider>
            </SafeAreaContext.Provider>
          </div>
        </div>

        {/* Home indicator */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/30 rounded-full"
          style={{
            width: 134 * scale,
            height: 5 * scale,
          }}
        />
      </div>

      {/* Device label */}
      {showLabel && (
        <div className="mt-3 text-sm font-medium text-gray-600">{displayLabel}</div>
      )}
    </div>
  )
}

DeviceFrame.displayName = 'DeviceFrame'
