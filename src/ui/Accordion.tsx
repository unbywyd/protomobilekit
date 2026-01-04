import React, { useState, createContext, useContext } from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

// Accordion Group Context
interface AccordionContextValue {
  expandedItems: Set<string>
  toggle: (id: string) => void
  multiple: boolean
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

export interface AccordionGroupProps {
  children: React.ReactNode
  /** Allow multiple items open */
  multiple?: boolean
  /** Default expanded items */
  defaultExpanded?: string[]
  className?: string
}

export function AccordionGroup({
  children,
  multiple = false,
  defaultExpanded = [],
  className,
}: AccordionGroupProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(defaultExpanded)
  )

  const toggle = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!multiple) {
          next.clear()
        }
        next.add(id)
      }
      return next
    })
  }

  return (
    <AccordionContext.Provider value={{ expandedItems, toggle, multiple }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  )
}

AccordionGroup.displayName = 'AccordionGroup'

export interface AccordionItemProps {
  id: string
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export function AccordionItem({
  id,
  title,
  subtitle,
  icon,
  children,
  disabled = false,
  className,
}: AccordionItemProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const context = useContext(AccordionContext)

  // Standalone mode (without AccordionGroup)
  const [localExpanded, setLocalExpanded] = useState(false)

  const isExpanded = context ? context.expandedItems.has(id) : localExpanded
  const handleToggle = () => {
    if (disabled) return
    if (context) {
      context.toggle(id)
    } else {
      setLocalExpanded(!localExpanded)
    }
  }

  return (
    <div
      className={cn('overflow-hidden', className)}
      style={{
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* Header */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
          !disabled && 'active:bg-opacity-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          backgroundColor: isExpanded ? colors.surfaceSecondary : 'transparent',
        }}
      >
        {icon && (
          <span style={{ color: colors.primary }}>{icon}</span>
        )}
        <div className="flex-1 min-w-0">
          <div
            className={cn('font-medium', isIOS ? 'text-[17px]' : 'text-base')}
            style={{ color: colors.text }}
          >
            {title}
          </div>
          {subtitle && (
            <div className="text-sm" style={{ color: colors.textSecondary }}>
              {subtitle}
            </div>
          )}
        </div>
        {/* Chevron */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={colors.textSecondary}
          className={cn(
            'transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {/* Content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div
          className="px-4 py-3"
          style={{ backgroundColor: colors.surfaceSecondary }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

AccordionItem.displayName = 'AccordionItem'

// Simple standalone Accordion
export interface AccordionProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  icon?: React.ReactNode
  className?: string
}

export function Accordion({
  title,
  children,
  defaultExpanded = false,
  icon,
  className,
}: AccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { colors } = useTheme()

  return (
    <div
      className={cn('overflow-hidden rounded-lg', className)}
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {icon && <span style={{ color: colors.primary }}>{icon}</span>}
        <span className="flex-1 font-medium" style={{ color: colors.text }}>
          {title}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={colors.textSecondary}
          className={cn(
            'transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          expanded ? 'max-h-[500px]' : 'max-h-0'
        )}
      >
        <div
          className="px-4 py-3 border-t"
          style={{ borderColor: colors.border }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

Accordion.displayName = 'Accordion'
