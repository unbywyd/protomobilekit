import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  className,
}: SwitchProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const switchElement = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer transition-colors duration-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        width: isIOS ? 51 : 52,
        height: isIOS ? 31 : 32,
        borderRadius: isIOS ? 15.5 : 16,
        backgroundColor: checked ? colors.primary : colors.border,
        padding: 2,
      }}
    >
      <span
        className="block rounded-full shadow-sm transition-transform duration-200"
        style={{
          width: isIOS ? 27 : 28,
          height: isIOS ? 27 : 28,
          backgroundColor: colors.surface,
          transform: checked
            ? `translateX(${isIOS ? 20 : 20}px)`
            : 'translateX(0)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )

  if (label) {
    return (
      <label className="flex items-center justify-between">
        <span style={{ color: colors.text }}>{label}</span>
        {switchElement}
      </label>
    )
  }

  return switchElement
}

Switch.displayName = 'Switch'
