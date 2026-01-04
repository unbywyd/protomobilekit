import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface CardProps {
  children: React.ReactNode
  /** Card title */
  title?: string
  /** Card subtitle */
  subtitle?: string
  /** Header right content */
  headerRight?: React.ReactNode
  /** Footer content */
  footer?: React.ReactNode
  /** Click handler */
  onPress?: () => void
  /** Card padding */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Shadow level */
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Card - Container card component
 */
export function Card({
  children,
  title,
  subtitle,
  headerRight,
  footer,
  onPress,
  padding = 'md',
  shadow = 'sm',
  className,
}: CardProps) {
  const { colors } = useTheme()

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  }

  const hasHeader = title || subtitle || headerRight

  // Use div with role="button" when interactive to allow nested buttons
  return (
    <div
      className={cn(
        'rounded-xl border',
        shadowClasses[shadow],
        onPress && 'hover:shadow-md active:scale-[0.99] transition-all cursor-pointer',
        className
      )}
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      onClick={onPress}
      role={onPress ? 'button' : undefined}
      tabIndex={onPress ? 0 : undefined}
      onKeyDown={onPress ? (e) => { if (e.key === 'Enter' || e.key === ' ') onPress() } : undefined}
    >
      {hasHeader && (
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
          <div className="flex-1 min-w-0">
            {title && <h3 className="text-base font-semibold truncate" style={{ color: colors.text }}>{title}</h3>}
            {subtitle && <p className="text-sm truncate" style={{ color: colors.textSecondary }}>{subtitle}</p>}
          </div>
          {headerRight && <div className="ml-3 shrink-0">{headerRight}</div>}
        </div>
      )}
      <div className={cn(paddingClasses[padding], hasHeader && padding !== 'none' && 'pt-0')}>
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t rounded-b-xl" style={{ borderColor: colors.border, backgroundColor: colors.surfaceSecondary }}>{footer}</div>
      )}
    </div>
  )
}

Card.displayName = 'Card'
