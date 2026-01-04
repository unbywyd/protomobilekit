import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'
import { useLocale } from './locale'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string
  /** Error message */
  error?: string
  /** Helper text */
  helper?: string
  /** Input size */
  size?: 'sm' | 'md' | 'lg'
  /** Left icon/addon */
  leftAddon?: React.ReactNode
  /** Right icon/addon */
  rightAddon?: React.ReactNode
  /** Input style variant */
  variant?: 'outline' | 'filled' | 'underline'
}

/**
 * Input - Text input component (iOS/Android adaptive)
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      size = 'md',
      leftAddon,
      rightAddon,
      variant = 'outline',
      className,
      ...props
    },
    ref
  ) => {
    const { platform, colors } = useTheme()
    const isIOS = platform === 'ios'

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return { height: isIOS ? 36 : 40, fontSize: 14, padding: 12 }
        case 'lg':
          return { height: isIOS ? 52 : 56, fontSize: 17, padding: 16 }
        default:
          return { height: isIOS ? 44 : 48, fontSize: 16, padding: 14 }
      }
    }

    const sizeStyles = getSizeStyles()

    const getVariantStyles = () => {
      switch (variant) {
        case 'filled':
          return {
            backgroundColor: colors.surfaceSecondary,
            borderWidth: 0,
            borderRadius: isIOS ? 10 : 8,
          }
        case 'underline':
          return {
            backgroundColor: 'transparent',
            borderWidth: 0,
            borderBottomWidth: error ? 2 : 1,
            borderBottomColor: error ? colors.danger : colors.border,
            borderRadius: 0,
          }
        default:
          return {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: isIOS ? 10 : 8,
          }
      }
    }

    const variantStyles = getVariantStyles()

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            className={cn(
              'font-medium',
              isIOS ? 'text-sm' : 'text-xs uppercase tracking-wide'
            )}
            style={{ color: colors.textSecondary }}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <div
              className="absolute left-3 flex items-center justify-center"
              style={{ color: colors.textSecondary }}
            >
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full transition-colors',
              'focus:outline-none focus:border-primary',
              props.disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            style={{
              ...variantStyles,
              height: sizeStyles.height,
              fontSize: sizeStyles.fontSize,
              paddingLeft: leftAddon ? sizeStyles.padding + 28 : sizeStyles.padding,
              paddingRight: rightAddon ? sizeStyles.padding + 28 : sizeStyles.padding,
              color: colors.text,
              // @ts-ignore - CSS custom property for focus state
              '--tw-border-opacity': 1,
            }}
            onFocus={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = colors.primary
              }
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = colors.border
              }
              props.onBlur?.(e)
            }}
            {...props}
          />
          {rightAddon && (
            <div
              className="absolute right-3 flex items-center justify-center"
              style={{ color: colors.textSecondary }}
            >
              {rightAddon}
            </div>
          )}
        </div>
        {/* Only show error/helper if label exists (not inside FormField) */}
        {label && error && (
          <p className="text-sm" style={{ color: colors.danger }}>{error}</p>
        )}
        {label && helper && !error && (
          <p className="text-sm" style={{ color: colors.textSecondary }}>{helper}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Select dropdown
export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  label,
  error,
  disabled = false,
  className,
}: SelectProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const locale = useLocale()
  const [open, setOpen] = React.useState(false)
  const selectRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  // Close on outside click
  React.useEffect(() => {
    if (!open) return

    const handleClick = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          className={cn(
            'font-medium',
            isIOS ? 'text-sm' : 'text-xs uppercase tracking-wide'
          )}
          style={{ color: colors.textSecondary }}
        >
          {label}
        </label>
      )}
      <div ref={selectRef} className="relative">
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between text-left transition-colors',
            'focus:outline-none',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          style={{
            height: isIOS ? 44 : 48,
            fontSize: 16,
            paddingLeft: 14,
            paddingRight: 14,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: isIOS ? 10 : 8,
            color: selectedOption ? colors.text : colors.textSecondary,
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = colors.primary
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = colors.border
            }
          }}
        >
          <span className="flex-1 truncate">
            {selectedOption ? selectedOption.label : (placeholder || locale.select)}
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn('transition-transform', open && 'rotate-180')}
            style={{ color: colors.textSecondary }}
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute top-full mt-1 z-50 w-full max-h-[200px] overflow-y-auto shadow-lg"
            style={{
              backgroundColor: colors.surface,
              borderRadius: isIOS ? '14px' : '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors',
                    'first:rounded-t-lg last:rounded-b-lg',
                    isSelected && 'font-medium'
                  )}
                  style={{
                    backgroundColor: isSelected
                      ? `${colors.primary}15`
                      : 'transparent',
                    color: isSelected ? colors.primary : colors.text,
                  }}
                >
                  <span className={isIOS ? 'text-[17px]' : 'text-base'}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={colors.primary}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm" style={{ color: colors.danger }}>{error}</p>
      )}
    </div>
  )
}

Select.displayName = 'Select'
