import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface Tab {
  key: string
  label: string
  icon?: React.ReactNode
}

export interface TabsProps {
  tabs: Tab[]
  activeKey: string
  onChange: (key: string) => void
  /** Tab bar style */
  variant?: 'default' | 'pills' | 'underline'
  /** Full width tabs */
  fullWidth?: boolean
  className?: string
}

export function Tabs({
  tabs,
  activeKey,
  onChange,
  variant = 'default',
  fullWidth = true,
  className,
}: TabsProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  if (variant === 'pills') {
    // iOS Segmented Control style
    return (
      <div
        className={cn(
          'flex p-0.5 rounded-lg',
          fullWidth && 'w-full',
          className
        )}
        style={{
          backgroundColor: isIOS ? 'rgba(118, 118, 128, 0.12)' : colors.surfaceSecondary,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-sm font-medium rounded-md transition-all',
              )}
              style={{
                backgroundColor: isActive ? colors.surface : 'transparent',
                color: isActive ? colors.text : colors.textSecondary,
                boxShadow: isActive
                  ? '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
                  : 'none',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === 'underline') {
    // Material tabs with underline
    return (
      <div
        className={cn(
          'flex border-b',
          fullWidth && 'w-full',
          className
        )}
        style={{ borderColor: colors.border }}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors',
              )}
              style={{
                color: isActive ? colors.primary : colors.textSecondary,
                borderBottomWidth: 2,
                borderBottomColor: isActive ? colors.primary : 'transparent',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>
    )
  }

  // Default style - same as underline for clarity
  return (
    <div
      className={cn(
        'flex',
        fullWidth && 'w-full',
        className
      )}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors"
            style={{
              color: isActive ? colors.primary : colors.textSecondary,
              borderBottomWidth: 2,
              borderBottomColor: isActive ? colors.primary : 'transparent',
              marginBottom: -1,
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

Tabs.displayName = 'Tabs'

// Bottom Tab Bar for navigation
export interface TabBarItem {
  key: string
  label: string
  icon: React.ReactNode
  activeIcon?: React.ReactNode
  badge?: number | string
}

export interface TabBarProps {
  items: TabBarItem[]
  activeKey: string
  onChange: (key: string) => void
  className?: string
}

export function TabBar({
  items,
  activeKey,
  onChange,
  className,
}: TabBarProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  return (
    <nav
      className={cn(
        'flex items-end justify-around shrink-0 pb-safe-bottom',
        className
      )}
      style={{
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        height: isIOS ? 83 : 80,
        paddingTop: 8,
      }}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className="flex flex-col items-center justify-center flex-1 relative"
          >
            {/* Badge */}
            {item.badge !== undefined && (
              <span
                className="absolute -top-1 left-1/2 ml-2 px-1.5 min-w-[18px] h-[18px] text-xs font-medium rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: colors.danger,
                  color: '#FFFFFF',
                }}
              >
                {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
              </span>
            )}

            {/* Icon */}
            <div
              style={{
                color: isActive ? colors.primary : colors.textSecondary,
              }}
            >
              {isActive && item.activeIcon ? item.activeIcon : item.icon}
            </div>

            {/* Label */}
            <span
              className="text-[10px] mt-1"
              style={{
                color: isActive ? colors.primary : colors.textSecondary,
                fontWeight: isActive ? '500' : '400',
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

TabBar.displayName = 'TabBar'
