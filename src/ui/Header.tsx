import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface HeaderProps {
  /** Title text */
  title?: string
  /** Subtitle text */
  subtitle?: string
  /** Left side content (usually back button) */
  left?: React.ReactNode
  /** Right side content (usually action buttons) */
  right?: React.ReactNode
  /** Large title style (iOS) */
  largeTitle?: boolean
  /** Make header transparent */
  transparent?: boolean
  /** Add bottom border */
  bordered?: boolean
  className?: string
}

/**
 * Header - Navigation header for screens (iOS/Android adaptive)
 */
export function Header({
  title,
  subtitle,
  left,
  right,
  largeTitle = false,
  transparent = false,
  bordered = true,
  className,
}: HeaderProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  // iOS Large Title style
  if (isIOS && largeTitle) {
    return (
      <header
        className={cn('flex flex-col shrink-0', className)}
        style={{
          backgroundColor: transparent ? 'transparent' : colors.surface,
        }}
      >
        {/* Standard nav row */}
        <div className="flex items-center justify-between h-11 px-4">
          <div className="flex items-center min-w-[60px]">{left}</div>
          <div className="flex items-center justify-end min-w-[60px]">{right}</div>
        </div>
        {/* Large title */}
        <div className="px-4 pb-2">
          <h1
            className="text-[34px] font-bold leading-tight"
            style={{ color: colors.text }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-base mt-0.5" style={{ color: colors.textSecondary }}>
              {subtitle}
            </p>
          )}
        </div>
        {bordered && (
          <div className="h-px" style={{ backgroundColor: colors.border }} />
        )}
      </header>
    )
  }

  // Standard iOS header
  if (isIOS) {
    return (
      <header
        className={cn('flex flex-col shrink-0', className)}
        style={{
          backgroundColor: transparent ? 'transparent' : colors.surface,
        }}
      >
        <div className="flex items-center justify-between h-11 px-4">
          <div className="flex items-center min-w-[60px]">{left}</div>
          <div className="flex-1 text-center">
            <h1
              className="text-[17px] font-semibold truncate"
              style={{ color: colors.text }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs truncate" style={{ color: colors.textSecondary }}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center justify-end min-w-[60px]">{right}</div>
        </div>
        {bordered && (
          <div className="h-px" style={{ backgroundColor: colors.border }} />
        )}
      </header>
    )
  }

  // Android (Material) header
  return (
    <header
      className={cn('flex flex-col shrink-0', className)}
      style={{
        backgroundColor: transparent ? 'transparent' : colors.surface,
      }}
    >
      <div className="flex items-center h-14 px-4 gap-4">
        {left && <div className="shrink-0 -ml-2">{left}</div>}
        <div className="flex-1 min-w-0">
          <h1
            className="text-xl font-medium truncate"
            style={{ color: colors.text }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm truncate" style={{ color: colors.textSecondary }}>
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="shrink-0 flex items-center gap-2">{right}</div>}
      </div>
      {bordered && (
        <div className="h-px" style={{ backgroundColor: colors.border }} />
      )}
    </header>
  )
}

Header.displayName = 'Header'

// Back button helper
export interface BackButtonProps {
  onPress: () => void
  label?: string
}

export function BackButton({ onPress, label }: BackButtonProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  if (isIOS) {
    return (
      <button
        onClick={onPress}
        className="flex items-center gap-1 -ml-2 px-2 py-1"
        style={{ color: colors.primary }}
      >
        <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
          <path d="M10 20l1.41-1.41L3.83 10l7.58-7.59L10 1 1 10l9 10z" />
        </svg>
        {label && <span className="text-[17px]">{label}</span>}
      </button>
    )
  }

  // Android back arrow
  return (
    <button onClick={onPress} className="p-2 -ml-2 rounded-full">
      <svg width="24" height="24" viewBox="0 0 24 24" fill={colors.text}>
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </svg>
    </button>
  )
}

BackButton.displayName = 'BackButton'

// Icon button helper for header actions
export interface IconButtonProps {
  icon: React.ReactNode
  onPress: () => void
  badge?: number | string
}

export function IconButton({ icon, onPress, badge }: IconButtonProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  return (
    <button
      onClick={onPress}
      className="relative p-2 rounded-full"
      style={{ color: isIOS ? colors.primary : colors.text }}
    >
      {icon}
      {badge !== undefined && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 text-[10px] font-medium rounded-full flex items-center justify-center"
          style={{
            backgroundColor: colors.danger,
            color: '#FFFFFF',
          }}
        >
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}

IconButton.displayName = 'IconButton'
