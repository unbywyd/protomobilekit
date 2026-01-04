import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface FABProps {
  icon: React.ReactNode
  onPress: () => void
  /** FAB size */
  size?: 'sm' | 'md' | 'lg'
  /** FAB color */
  variant?: 'primary' | 'secondary' | 'surface'
  /** Extended FAB with label */
  label?: string
  /** Position on screen */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  /** Disabled state */
  disabled?: boolean
  className?: string
}

export function FAB({
  icon,
  onPress,
  size = 'md',
  variant = 'primary',
  label,
  position = 'bottom-right',
  disabled = false,
  className,
}: FABProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  const sizeMap = {
    sm: { button: 40, icon: 20 },
    md: { button: 56, icon: 24 },
    lg: { button: 64, icon: 28 },
  }

  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: colors.surfaceSecondary,
          text: colors.primary,
        }
      case 'surface':
        return {
          bg: colors.surface,
          text: colors.primary,
        }
      default:
        return {
          bg: colors.primary,
          text: '#FFFFFF',
        }
    }
  }

  const positionClasses = {
    'bottom-right': 'right-4 bottom-4',
    'bottom-left': 'left-4 bottom-4',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-4',
  }

  const { button: buttonSize, icon: iconSize } = sizeMap[size]
  const { bg, text } = getColors()

  // Extended FAB
  if (label) {
    return (
      <button
        onClick={onPress}
        disabled={disabled}
        className={cn(
          'absolute z-40 flex items-center gap-3 px-4 shadow-lg transition-transform',
          'hover:scale-105 active:scale-95',
          disabled && 'opacity-50 cursor-not-allowed',
          positionClasses[position],
          isIOS ? 'rounded-full' : 'rounded-2xl',
          className
        )}
        style={{
          height: buttonSize,
          backgroundColor: bg,
          color: text,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <span style={{ width: iconSize, height: iconSize }}>{icon}</span>
        <span className="font-medium text-sm pr-1">{label}</span>
      </button>
    )
  }

  // Regular FAB
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={cn(
        'absolute z-40 flex items-center justify-center shadow-lg transition-transform',
        'hover:scale-105 active:scale-95',
        disabled && 'opacity-50 cursor-not-allowed',
        positionClasses[position],
        isIOS ? 'rounded-full' : 'rounded-2xl',
        className
      )}
      style={{
        width: buttonSize,
        height: buttonSize,
        backgroundColor: bg,
        color: text,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <span style={{ width: iconSize, height: iconSize }}>{icon}</span>
    </button>
  )
}

FAB.displayName = 'FAB'

// Speed dial (expandable FAB)
export interface SpeedDialAction {
  icon: React.ReactNode
  label: string
  onPress: () => void
}

export interface SpeedDialProps {
  icon: React.ReactNode
  actions: SpeedDialAction[]
  position?: 'bottom-right' | 'bottom-left'
  className?: string
}

export function SpeedDial({
  icon,
  actions,
  position = 'bottom-right',
  className,
}: SpeedDialProps) {
  const { colors } = useTheme()
  const [open, setOpen] = React.useState(false)

  const positionClasses = {
    'bottom-right': 'right-4 bottom-4 items-end',
    'bottom-left': 'left-4 bottom-4 items-start',
  }

  return (
    <div
      className={cn(
        'absolute z-40 flex flex-col gap-3',
        positionClasses[position],
        className
      )}
    >
      {/* Actions */}
      {open && (
        <div className="flex flex-col gap-3 mb-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onPress()
                setOpen(false)
              }}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-full shadow-md',
                'animate-fade-in',
                position === 'bottom-right' ? 'flex-row-reverse' : 'flex-row'
              )}
              style={{
                backgroundColor: colors.surface,
                animationDelay: `${index * 50}ms`,
              }}
            >
              <span
                className="w-10 h-10 flex items-center justify-center rounded-full"
                style={{ backgroundColor: colors.surfaceSecondary }}
              >
                {action.icon}
              </span>
              <span
                className="text-sm font-medium px-2"
                style={{ color: colors.text }}
              >
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-transform',
          open && 'rotate-45'
        )}
        style={{
          backgroundColor: colors.primary,
          color: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        {icon}
      </button>

      {/* Animation styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}

SpeedDial.displayName = 'SpeedDial'
