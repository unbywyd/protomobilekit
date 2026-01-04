import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface ListProps<T> {
  /** Data items to render */
  items: T[]
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Key extractor function */
  keyExtractor?: (item: T, index: number) => string
  /** Empty state content */
  emptyContent?: React.ReactNode
  /** Show dividers between items */
  dividers?: boolean
  /** Divider inset */
  dividerInset?: 'none' | 'left' | 'both'
  /** List header */
  header?: React.ReactNode
  /** List footer */
  footer?: React.ReactNode
  className?: string
}

/**
 * List - Scrollable list component
 */
export function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyContent,
  dividers = true,
  dividerInset = 'none',
  header,
  footer,
  className,
}: ListProps<T>) {
  const { colors } = useTheme()

  if (items.length === 0 && emptyContent) {
    return (
      <div
        className={cn('flex items-center justify-center p-8', className)}
        style={{ color: colors.textSecondary }}
      >
        {emptyContent}
      </div>
    )
  }

  const getDividerStyle = () => {
    switch (dividerInset) {
      case 'left': return { marginLeft: 56 }
      case 'both': return { marginLeft: 16, marginRight: 16 }
      default: return {}
    }
  }

  return (
    <div
      className={cn('flex flex-col', className)}
      style={{ backgroundColor: colors.surface }}
    >
      {header && (
        <div
          className="px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: colors.surfaceSecondary, color: colors.textSecondary }}
        >
          {header}
        </div>
      )}
      {items.map((item, index) => {
        const key = keyExtractor ? keyExtractor(item, index) : index.toString()
        return (
          <div key={key}>
            {renderItem(item, index)}
            {dividers && index < items.length - 1 && (
              <div
                className="h-px"
                style={{
                  backgroundColor: colors.border,
                  ...getDividerStyle(),
                }}
              />
            )}
          </div>
        )
      })}
      {footer && (
        <div
          className="px-4 py-2 text-sm"
          style={{ backgroundColor: colors.surfaceSecondary, color: colors.textSecondary }}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

List.displayName = 'List'

// Enhanced List Item
export interface ListItemProps {
  children: React.ReactNode
  /** Left side content (icon/avatar) */
  left?: React.ReactNode
  /** Right side content (chevron/badge/switch) */
  right?: React.ReactNode
  /** Subtitle text */
  subtitle?: string
  /** Description (third line) */
  description?: string
  /** Click handler */
  onPress?: () => void
  /** Show chevron arrow */
  showChevron?: boolean
  /** Destructive style */
  destructive?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Selected state */
  selected?: boolean
  className?: string
}

export function ListItem({
  children,
  left,
  right,
  subtitle,
  description,
  onPress,
  showChevron = false,
  destructive = false,
  disabled = false,
  selected = false,
  className,
}: ListItemProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const Component = onPress ? 'button' : 'div'

  const textColor = destructive ? colors.danger : colors.text

  return (
    <Component
      className={cn(
        'flex items-center w-full px-4 text-left transition-colors',
        isIOS ? 'py-3 min-h-[44px]' : 'py-3 min-h-[48px]',
        onPress && !disabled && 'active:opacity-70',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        backgroundColor: selected ? colors.surfaceSecondary : 'transparent',
      }}
      onClick={disabled ? undefined : onPress}
      disabled={disabled}
    >
      {left && (
        <div
          className="mr-3 shrink-0 flex items-center justify-center"
          style={{ width: 28, color: destructive ? colors.danger : colors.primary }}
        >
          {left}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div
          className={cn('truncate', isIOS ? 'text-[17px]' : 'text-base')}
          style={{ color: textColor }}
        >
          {children}
        </div>
        {subtitle && (
          <div
            className="text-sm truncate"
            style={{ color: colors.textSecondary }}
          >
            {subtitle}
          </div>
        )}
        {description && (
          <div
            className="text-xs truncate mt-0.5"
            style={{ color: colors.textSecondary }}
          >
            {description}
          </div>
        )}
      </div>
      {right && (
        <div className="ml-3 shrink-0 flex items-center" style={{ color: colors.textSecondary }}>
          {right}
        </div>
      )}
      {showChevron && (
        <div className="ml-2 shrink-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={colors.textSecondary}
          >
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
          </svg>
        </div>
      )}
    </Component>
  )
}

ListItem.displayName = 'ListItem'

// Menu Item (for settings-like lists)
export interface MenuItemProps {
  label: string
  value?: string
  icon?: React.ReactNode
  onPress?: () => void
  showChevron?: boolean
  destructive?: boolean
  disabled?: boolean
}

export function MenuItem({
  label,
  value,
  icon,
  onPress,
  showChevron = true,
  destructive = false,
  disabled = false,
}: MenuItemProps) {
  const { colors } = useTheme()

  return (
    <ListItem
      left={icon}
      right={value ? (
        <span style={{ color: colors.textSecondary }}>{value}</span>
      ) : undefined}
      onPress={onPress}
      showChevron={showChevron && !!onPress}
      destructive={destructive}
      disabled={disabled}
    >
      {label}
    </ListItem>
  )
}

MenuItem.displayName = 'MenuItem'
