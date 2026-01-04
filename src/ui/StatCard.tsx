import React from 'react'
import { useTheme } from './theme'
import { Text } from './Text'
import { cn } from './utils'

export interface StatCardProps {
  /** The numeric value to display */
  value: number | string
  /** Label below the value */
  label: string
  /** Icon to display (optional) */
  icon?: React.ReactNode
  /** Color variant or custom color */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'default' | string
  /** Additional className */
  className?: string
  /** Click handler */
  onPress?: () => void
}

/**
 * StatCard - Display a statistic with value, label and optional icon
 *
 * @example
 * ```tsx
 * <StatCard value={42} label="Orders" color="primary" />
 * <StatCard value={15} label="Pending" color="warning" icon={<Clock size={20} />} />
 * ```
 */
export function StatCard({
  value,
  label,
  icon,
  color = 'default',
  className,
  onPress,
}: StatCardProps) {
  const { colors } = useTheme()

  // Resolve color
  let valueColor: string
  switch (color) {
    case 'primary': valueColor = colors.primary; break
    case 'success': valueColor = colors.success; break
    case 'warning': valueColor = '#FF9500'; break
    case 'danger': valueColor = colors.danger; break
    case 'default': valueColor = colors.text; break
    default: valueColor = color // custom color string
  }

  const Component = onPress ? 'button' : 'div'

  return (
    <Component
      className={cn(
        'rounded-xl p-4 flex flex-col items-center justify-center',
        onPress && 'cursor-pointer active:opacity-80 transition-opacity',
        className
      )}
      style={{ backgroundColor: colors.surfaceSecondary }}
      onClick={onPress}
    >
      {icon && (
        <div className="mb-2" style={{ color: valueColor }}>
          {icon}
        </div>
      )}
      <Text size="2xl" bold style={{ color: valueColor }}>
        {value}
      </Text>
      <Text secondary size="xs" className="mt-1">
        {label}
      </Text>
    </Component>
  )
}

export interface StatGridProps {
  /** Stat items to display */
  children: React.ReactNode
  /** Number of columns (default 2) */
  columns?: 2 | 3 | 4
  /** Gap between items */
  gap?: number
  /** Additional className */
  className?: string
}

/**
 * StatGrid - Grid container for StatCards
 *
 * @example
 * ```tsx
 * <StatGrid columns={2}>
 *   <StatCard value={42} label="Total" />
 *   <StatCard value={15} label="Pending" color="warning" />
 *   <StatCard value={20} label="Active" color="primary" />
 *   <StatCard value={7} label="Done" color="success" />
 * </StatGrid>
 * ```
 */
export function StatGrid({
  children,
  columns = 2,
  gap = 12,
  className,
}: StatGridProps) {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <div
      className={cn('grid', gridClass[columns], className)}
      style={{ gap }}
    >
      {children}
    </div>
  )
}

// Convenience preset for common dashboard stats
export interface DashboardStatsProps {
  stats: Array<{
    value: number | string
    label: string
    color?: StatCardProps['color']
    icon?: React.ReactNode
  }>
  columns?: 2 | 3 | 4
  className?: string
}

/**
 * DashboardStats - Pre-configured stat grid for dashboards
 *
 * @example
 * ```tsx
 * <DashboardStats
 *   stats={[
 *     { value: stats.total, label: 'Total' },
 *     { value: stats.pending, label: 'Pending', color: 'warning' },
 *     { value: stats.active, label: 'Active', color: 'primary' },
 *     { value: stats.done, label: 'Done', color: 'success' },
 *   ]}
 * />
 * ```
 */
export function DashboardStats({ stats, columns, className }: DashboardStatsProps) {
  const cols = columns ?? (stats.length <= 2 ? 2 : stats.length <= 3 ? 3 : stats.length === 4 ? 2 : 4)

  return (
    <StatGrid columns={cols as 2 | 3 | 4} className={className}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          value={stat.value}
          label={stat.label}
          color={stat.color}
          icon={stat.icon}
        />
      ))}
    </StatGrid>
  )
}
