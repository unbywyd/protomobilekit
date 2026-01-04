import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface DividerProps {
  /** Horizontal or vertical */
  orientation?: 'horizontal' | 'vertical'
  /** Inset from edges */
  inset?: 'none' | 'left' | 'right' | 'both'
  /** Show text in center */
  label?: string
  className?: string
}

export function Divider({
  orientation = 'horizontal',
  inset = 'none',
  label,
  className,
}: DividerProps) {
  const { colors } = useTheme()

  const insetStyles = {
    none: {},
    left: { marginLeft: 16 },
    right: { marginRight: 16 },
    both: { marginLeft: 16, marginRight: 16 },
  }

  if (orientation === 'vertical') {
    return (
      <div
        className={cn('w-px self-stretch', className)}
        style={{
          backgroundColor: colors.border,
          ...insetStyles[inset],
        }}
      />
    )
  }

  if (label) {
    return (
      <div
        className={cn('flex items-center gap-4', className)}
        style={insetStyles[inset]}
      >
        <div
          className="flex-1 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <span
          className="text-xs font-medium uppercase"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </span>
        <div
          className="flex-1 h-px"
          style={{ backgroundColor: colors.border }}
        />
      </div>
    )
  }

  return (
    <div
      className={cn('h-px w-full', className)}
      style={{
        backgroundColor: colors.border,
        ...insetStyles[inset],
      }}
    />
  )
}

Divider.displayName = 'Divider'

// Spacer for flex layouts
export interface SpacerProps {
  size?: number | 'flex'
  className?: string
}

export function Spacer({ size = 'flex', className }: SpacerProps) {
  if (size === 'flex') {
    return <div className={cn('flex-1', className)} />
  }

  return <div className={className} style={{ height: size, width: size }} />
}

Spacer.displayName = 'Spacer'
