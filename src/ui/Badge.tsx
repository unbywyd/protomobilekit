import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface BadgeProps {
  children: React.ReactNode
  /** Badge variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  /** Badge size */
  size?: 'sm' | 'md' | 'lg'
  /** Dot style (no content) */
  dot?: boolean
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primary, text: colors.primaryText }
      case 'success':
        return { bg: colors.success, text: colors.primaryText }
      case 'warning':
        return { bg: colors.textSecondary, text: colors.primaryText }
      case 'danger':
        return { bg: colors.danger, text: colors.primaryText }
      default:
        return { bg: colors.surfaceSecondary, text: colors.textSecondary }
    }
  }

  const { bg, text } = getColors()

  const sizeStyles = {
    sm: {
      height: dot ? 8 : 16,
      minWidth: dot ? 8 : 16,
      fontSize: 10,
      padding: dot ? 0 : '0 4px',
    },
    md: {
      height: dot ? 10 : 20,
      minWidth: dot ? 10 : 20,
      fontSize: 12,
      padding: dot ? 0 : '0 6px',
    },
    lg: {
      height: dot ? 12 : 24,
      minWidth: dot ? 12 : 24,
      fontSize: 14,
      padding: dot ? 0 : '0 8px',
    },
  }

  const style = sizeStyles[size]

  if (dot) {
    return (
      <span
        className={cn('inline-block rounded-full', className)}
        style={{
          width: style.height,
          height: style.height,
          backgroundColor: bg,
        }}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap',
        className
      )}
      style={{
        height: style.height,
        minWidth: style.minWidth,
        fontSize: style.fontSize,
        padding: style.padding,
        backgroundColor: bg,
        color: text,
      }}
    >
      {children}
    </span>
  )
}

Badge.displayName = 'Badge'

// Chip component (selectable/dismissible)
export interface ChipProps {
  children: React.ReactNode
  /** Selected state */
  selected?: boolean
  /** Show close/dismiss button */
  dismissible?: boolean
  onPress?: () => void
  onDismiss?: () => void
  /** Left icon */
  icon?: React.ReactNode
  /** Disabled state */
  disabled?: boolean
  className?: string
}

export function Chip({
  children,
  selected = false,
  dismissible = false,
  onPress,
  onDismiss,
  icon,
  disabled = false,
  className,
}: ChipProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium transition-colors',
        isIOS ? 'h-8 px-3 rounded-full text-sm' : 'h-8 px-3 rounded-lg text-sm',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        backgroundColor: selected ? colors.primary : colors.surfaceSecondary,
        color: selected ? '#FFFFFF' : colors.text,
        borderWidth: selected ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {dismissible && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDismiss?.()
          }}
          className="shrink-0 -mr-1 p-0.5 rounded-full"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={selected ? '#FFFFFF' : colors.textSecondary}
          >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      )}
    </button>
  )
}

Chip.displayName = 'Chip'
