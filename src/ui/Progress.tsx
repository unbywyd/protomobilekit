import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number
  /** Show value label */
  showValue?: boolean
  /** Bar height */
  size?: 'sm' | 'md' | 'lg'
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  /** Indeterminate state (animated) */
  indeterminate?: boolean
  className?: string
}

export function ProgressBar({
  value,
  showValue = false,
  size = 'md',
  variant = 'primary',
  indeterminate = false,
  className,
}: ProgressBarProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  const clampedValue = Math.max(0, Math.min(100, value))

  const getColor = () => {
    switch (variant) {
      case 'success': return colors.success
      case 'warning': return colors.textSecondary
      case 'danger': return colors.danger
      default: return colors.primary
    }
  }

  const sizeMap = {
    sm: isIOS ? 2 : 2,
    md: isIOS ? 4 : 4,
    lg: isIOS ? 8 : 6,
  }

  const height = sizeMap[size]
  const color = getColor()

  return (
    <div className={cn('w-full', className)}>
      {/* Track */}
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{
          height,
          backgroundColor: colors.border,
        }}
      >
        {/* Fill */}
        {indeterminate ? (
          <div
            className="absolute h-full rounded-full animate-progress-indeterminate"
            style={{
              width: '30%',
              backgroundColor: color,
            }}
          />
        ) : (
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${clampedValue}%`,
              backgroundColor: color,
            }}
          />
        )}
      </div>

      {/* Value label */}
      {showValue && !indeterminate && (
        <div
          className="mt-1 text-xs text-right"
          style={{ color: colors.textSecondary }}
        >
          {Math.round(clampedValue)}%
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

ProgressBar.displayName = 'ProgressBar'

// Circular progress
export interface CircularProgressProps {
  /** Progress value (0-100) */
  value: number
  /** Size in pixels */
  size?: number
  /** Stroke width */
  strokeWidth?: number
  /** Show value in center */
  showValue?: boolean
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  /** Indeterminate state (spinning) */
  indeterminate?: boolean
  className?: string
}

export function CircularProgress({
  value,
  size = 48,
  strokeWidth = 4,
  showValue = false,
  variant = 'primary',
  indeterminate = false,
  className,
}: CircularProgressProps) {
  const { colors } = useTheme()

  const clampedValue = Math.max(0, Math.min(100, value))

  const getColor = () => {
    switch (variant) {
      case 'success': return colors.success
      case 'warning': return colors.textSecondary
      case 'danger': return colors.danger
      default: return colors.primary
    }
  }

  const color = getColor()
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className={indeterminate ? 'animate-spin' : ''}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.border}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.75 : strokeDashoffset}
          style={{ transition: indeterminate ? undefined : 'stroke-dashoffset 0.3s' }}
        />
      </svg>

      {/* Center value */}
      {showValue && !indeterminate && (
        <span
          className="absolute text-xs font-medium"
          style={{ color: colors.text }}
        >
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  )
}

CircularProgress.displayName = 'CircularProgress'
