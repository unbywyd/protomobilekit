import React from 'react'
import { Badge, type BadgeProps } from './Badge'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger'

export interface StatusConfig {
  [key: string]: BadgeVariant | {
    variant: BadgeVariant
    label?: string
  }
}

export interface StatusBadgeProps {
  /** The status value */
  status: string
  /** Status to variant mapping */
  config?: StatusConfig
  /** Custom className */
  className?: string
  /** Size */
  size?: BadgeProps['size']
}

// Default status configs for common patterns
const DEFAULT_ORDER_STATUS: StatusConfig = {
  pending: 'warning',
  confirmed: 'primary',
  preparing: 'primary',
  ready: 'warning',
  delivering: 'primary',
  delivered: 'success',
  completed: 'success',
  cancelled: 'danger',
  failed: 'danger',
}

const DEFAULT_USER_STATUS: StatusConfig = {
  active: 'success',
  inactive: 'default',
  online: 'success',
  offline: 'default',
  away: 'warning',
  busy: 'danger',
  available: 'success',
}

// Merge common defaults
const DEFAULT_CONFIG: StatusConfig = {
  ...DEFAULT_ORDER_STATUS,
  ...DEFAULT_USER_STATUS,
  // Fallback
  '*': 'default',
}

/**
 * StatusBadge - Badge with automatic variant based on status
 *
 * @example
 * ```tsx
 * // Uses default config
 * <StatusBadge status={order.status} />
 *
 * // Custom config
 * <StatusBadge
 *   status={item.priority}
 *   config={{
 *     high: 'danger',
 *     medium: 'warning',
 *     low: 'success',
 *   }}
 * />
 *
 * // With custom labels
 * <StatusBadge
 *   status={order.status}
 *   config={{
 *     pending: { variant: 'warning', label: 'Awaiting' },
 *     delivered: { variant: 'success', label: 'Done' },
 *   }}
 * />
 * ```
 */
export function StatusBadge({
  status,
  config,
  className,
  size,
}: StatusBadgeProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  // Get variant from config
  const statusConfig = mergedConfig[status] ?? mergedConfig['*'] ?? 'default'

  let variant: BadgeVariant
  let label: string

  if (typeof statusConfig === 'string') {
    variant = statusConfig
    label = status
  } else {
    variant = statusConfig.variant
    label = statusConfig.label ?? status
  }

  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  )
}

// Pre-configured status badges
export function OrderStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'config'>) {
  return <StatusBadge status={status} config={DEFAULT_ORDER_STATUS} {...props} />
}

export function UserStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'config'>) {
  return <StatusBadge status={status} config={DEFAULT_USER_STATUS} {...props} />
}
