import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export function Spinner({
  size = 'md',
  color,
  className,
}: SpinnerProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 36,
  }

  const actualSize = sizeMap[size]
  const strokeColor = color || colors.textSecondary

  if (isIOS) {
    // iOS style spinner (multiple lines)
    return (
      <div
        className={cn('relative animate-spin', className)}
        style={{
          width: actualSize,
          height: actualSize,
        }}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: 2,
              height: actualSize * 0.25,
              backgroundColor: strokeColor,
              opacity: (i + 1) / 12,
              left: '50%',
              top: 0,
              transformOrigin: `50% ${actualSize / 2}px`,
              transform: `translateX(-50%) rotate(${i * 30}deg)`,
              borderRadius: 1,
            }}
          />
        ))}
      </div>
    )
  }

  // Material circular progress
  return (
    <svg
      className={cn('animate-spin', className)}
      width={actualSize}
      height={actualSize}
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="60"
        strokeDashoffset="20"
        opacity={0.25}
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={colors.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="60"
        strokeDashoffset="45"
      />
    </svg>
  )
}

Spinner.displayName = 'Spinner'

// Full screen loading overlay
export interface LoadingOverlayProps {
  visible: boolean
  message?: string
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const { colors } = useTheme()

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: colors.overlay }}
    >
      <div
        className="flex flex-col items-center gap-4 p-6 rounded-2xl"
        style={{ backgroundColor: colors.surface }}
      >
        <Spinner size="lg" />
        {message && (
          <span className="text-sm" style={{ color: colors.text }}>
            {message}
          </span>
        )}
      </div>
    </div>
  )
}

LoadingOverlay.displayName = 'LoadingOverlay'
