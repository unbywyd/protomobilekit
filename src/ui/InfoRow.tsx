import React from 'react'
import { useTheme } from './theme'
import { cn } from './utils'

export interface InfoRowProps {
  /** Label text */
  label: string
  /** Value - can be text or any React node */
  children?: React.ReactNode
  /** Alternative to children */
  value?: React.ReactNode
  /** Additional className */
  className?: string
  /** Vertical layout (label above value) */
  vertical?: boolean
  /** Align value to the right (default true for horizontal) */
  alignRight?: boolean
}

/**
 * InfoRow - Key-value pair display
 *
 * @example
 * ```tsx
 * <InfoRow label="Status">
 *   <Badge variant="success">Active</Badge>
 * </InfoRow>
 *
 * <InfoRow label="Total" value={formatCurrency(order.total, 'RUB')} />
 *
 * <InfoRow label="Address" vertical>
 *   123 Main St, Apt 4
 * </InfoRow>
 * ```
 */
export function InfoRow({
  label,
  children,
  value,
  className,
  vertical = false,
  alignRight,
}: InfoRowProps) {
  const { colors } = useTheme()

  const content = children ?? value

  if (vertical) {
    return (
      <div className={cn('space-y-1', className)}>
        <div className="text-sm" style={{ color: colors.textSecondary }}>
          {label}
        </div>
        <div style={{ color: colors.text }}>{content}</div>
      </div>
    )
  }

  const shouldAlignRight = alignRight ?? true

  return (
    <div className={cn('flex items-center', shouldAlignRight ? 'justify-between' : 'gap-4', className)}>
      <span className="text-sm" style={{ color: colors.textSecondary }}>
        {label}
      </span>
      <span style={{ color: colors.text }}>{content}</span>
    </div>
  )
}

export interface InfoGroupProps {
  children: React.ReactNode
  /** Add dividers between rows */
  dividers?: boolean
  /** Gap between rows (default 12) */
  gap?: number
  className?: string
}

/**
 * InfoGroup - Group multiple InfoRows
 *
 * @example
 * ```tsx
 * <InfoGroup dividers>
 *   <InfoRow label="Status"><Badge>Active</Badge></InfoRow>
 *   <InfoRow label="Total">{formatCurrency(100, 'RUB')}</InfoRow>
 *   <InfoRow label="Date">{formatDate(order.createdAt)}</InfoRow>
 * </InfoGroup>
 * ```
 */
export function InfoGroup({ children, dividers = false, gap = 12, className }: InfoGroupProps) {
  const { colors } = useTheme()
  const childArray = React.Children.toArray(children)

  if (!dividers) {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap }}>
        {children}
      </div>
    )
  }

  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childArray.length - 1 && (
            <div
              className="my-3"
              style={{ height: 1, backgroundColor: colors.border }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
