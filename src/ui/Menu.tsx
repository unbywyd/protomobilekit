import React, { useState, useRef, useEffect } from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

// Dropdown Menu (3 dots menu)
export interface DropdownMenuItem {
  label: string
  icon?: React.ReactNode
  onPress: () => void
  destructive?: boolean
  disabled?: boolean
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[]
  /** Trigger element (defaults to 3-dots icon) */
  trigger?: React.ReactNode
  /** Menu position */
  position?: 'left' | 'right'
  className?: string
}

export function DropdownMenu({
  items,
  trigger,
  position = 'right',
  className,
}: DropdownMenuProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const defaultTrigger = (
    <button
      onClick={() => setOpen(!open)}
      className="p-2 rounded-full transition-colors"
      style={{ color: colors.text }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    </button>
  )

  return (
    <div ref={menuRef} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      {trigger ? (
        <div onClick={() => setOpen(!open)}>{trigger}</div>
      ) : (
        defaultTrigger
      )}

      {/* Menu dropdown */}
      {open && (
        <div
          className={cn(
            'absolute top-full mt-1 z-50 min-w-[180px] py-1 shadow-lg',
            position === 'right' ? 'right-0' : 'left-0'
          )}
          style={{
            backgroundColor: colors.surface,
            borderRadius: isIOS ? '14px' : '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (!item.disabled) {
                  item.onPress()
                  setOpen(false)
                }
              }}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                !item.disabled && 'active:bg-opacity-50',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
              style={{
                color: item.destructive ? colors.danger : colors.text,
              }}
            >
              {item.icon && (
                <span
                  className="shrink-0"
                  style={{ color: item.destructive ? colors.danger : colors.textSecondary }}
                >
                  {item.icon}
                </span>
              )}
              <span className={isIOS ? 'text-[17px]' : 'text-base'}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

DropdownMenu.displayName = 'DropdownMenu'

// Horizontal scrollable menu/chips
export interface HorizontalMenuItem {
  key: string
  label: string
  icon?: React.ReactNode
}

export interface HorizontalMenuProps {
  items: HorizontalMenuItem[]
  activeKey?: string
  onChange?: (key: string) => void
  /** Style variant */
  variant?: 'chips' | 'underline' | 'pills'
  className?: string
}

export function HorizontalMenu({
  items,
  activeKey,
  onChange,
  variant = 'chips',
  className,
}: HorizontalMenuProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const scrollRef = useRef<HTMLDivElement>(null)

  const getItemStyles = (isActive: boolean) => {
    switch (variant) {
      case 'underline':
        return {
          backgroundColor: 'transparent',
          color: isActive ? colors.primary : colors.textSecondary,
          borderBottomWidth: isActive ? 2 : 0,
          borderBottomColor: colors.primary,
          borderRadius: 0,
          padding: '8px 16px',
        }
      case 'pills':
        return {
          backgroundColor: isActive ? colors.primary : colors.surfaceSecondary,
          color: isActive ? '#FFFFFF' : colors.text,
          borderRadius: '20px',
          padding: '8px 16px',
        }
      default: // chips
        return {
          backgroundColor: isActive ? colors.primary : 'transparent',
          color: isActive ? '#FFFFFF' : colors.text,
          borderWidth: isActive ? 0 : 1,
          borderColor: colors.border,
          borderRadius: isIOS ? '18px' : '8px',
          padding: '6px 14px',
        }
    }
  }

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex gap-2 overflow-x-auto scrollbar-hide',
        variant === 'underline' && 'border-b',
        className
      )}
      style={{
        borderColor: variant === 'underline' ? colors.border : undefined,
        padding: variant === 'underline' ? 0 : '8px 16px',
      }}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey
        const styles = getItemStyles(isActive)

        return (
          <button
            key={item.key}
            onClick={() => onChange?.(item.key)}
            className="flex items-center gap-2 shrink-0 font-medium text-sm whitespace-nowrap transition-all"
            style={styles}
          >
            {item.icon}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

HorizontalMenu.displayName = 'HorizontalMenu'

// Context Menu (long press menu)
export interface ContextMenuProps {
  children: React.ReactNode
  items: DropdownMenuItem[]
  className?: string
}

export function ContextMenu({ children, items, className }: ContextMenuProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    longPressTimer.current = setTimeout(() => {
      setPosition({ x: touch.clientX, y: touch.clientY })
      setOpen(true)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setOpen(true)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return

    const handleClick = () => setOpen(false)
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [open])

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        onContextMenu={handleContextMenu}
      >
        {children}
      </div>

      {/* Context menu overlay */}
      {open && (
        <div
          className="fixed z-50 py-1 shadow-lg"
          style={{
            top: position.y,
            left: position.x,
            backgroundColor: colors.surface,
            borderRadius: isIOS ? '14px' : '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            minWidth: 180,
          }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (!item.disabled) {
                  item.onPress()
                  setOpen(false)
                }
              }}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                item.disabled && 'opacity-50'
              )}
              style={{
                color: item.destructive ? colors.danger : colors.text,
              }}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}

ContextMenu.displayName = 'ContextMenu'
