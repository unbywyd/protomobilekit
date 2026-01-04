import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  indeterminate?: boolean
  className?: string
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  label,
  indeterminate = false,
  className,
}: CheckboxProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const checkboxElement = (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center transition-all duration-150',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
      style={{
        width: isIOS ? 22 : 20,
        height: isIOS ? 22 : 20,
        borderRadius: isIOS ? 11 : 2,
        backgroundColor: checked || indeterminate
          ? colors.primary
          : 'transparent',
        borderWidth: checked || indeterminate ? 0 : 2,
        borderColor: isIOS ? colors.primary : colors.textSecondary,
      }}
    >
      {(checked || indeterminate) && (
        <svg
          width={isIOS ? 14 : 12}
          height={isIOS ? 14 : 12}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.primaryText}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {indeterminate ? (
            <path d="M5 12h14" />
          ) : (
            <path d="M20 6L9 17l-5-5" />
          )}
        </svg>
      )}
    </button>
  )

  if (label) {
    return (
      <label
        className={cn(
          'flex items-center gap-3 cursor-pointer',
          disabled && 'cursor-not-allowed',
          className
        )}
        onClick={handleClick}
      >
        {checkboxElement}
        <span style={{ color: colors.text }}>{label}</span>
      </label>
    )
  }

  return checkboxElement
}

Checkbox.displayName = 'Checkbox'

// Radio button variant
export interface RadioProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
}

export function Radio({
  checked,
  onChange,
  disabled = false,
  label,
  className,
}: RadioProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  const handleClick = () => {
    if (!disabled && !checked) {
      onChange(true)
    }
  }

  const radioElement = (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center transition-all duration-150',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
      style={{
        width: isIOS ? 22 : 20,
        height: isIOS ? 22 : 20,
        borderRadius: '50%',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: checked ? colors.primary : colors.textSecondary,
      }}
    >
      {checked && (
        <div
          className="rounded-full"
          style={{
            width: isIOS ? 12 : 10,
            height: isIOS ? 12 : 10,
            backgroundColor: colors.primary,
          }}
        />
      )}
    </button>
  )

  if (label) {
    return (
      <label
        className={cn(
          'flex items-center gap-3 cursor-pointer',
          disabled && 'cursor-not-allowed',
          className
        )}
        onClick={handleClick}
      >
        {radioElement}
        <span style={{ color: colors.text }}>{label}</span>
      </label>
    )
  }

  return radioElement
}

Radio.displayName = 'Radio'

// Radio Group - manages radio selection state
export interface RadioGroupOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  value: string
  onChange: (value: string) => void
  options: RadioGroupOption[]
  /** Layout direction */
  direction?: 'vertical' | 'horizontal'
  /** Show as list items with separators */
  listStyle?: boolean
  disabled?: boolean
  className?: string
}

export function RadioGroup({
  value,
  onChange,
  options,
  direction = 'vertical',
  listStyle = false,
  disabled = false,
  className,
}: RadioGroupProps) {
  const { colors } = useTheme()

  return (
    <div
      role="radiogroup"
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap gap-4',
        className
      )}
    >
      {options.map((option, index) => {
        const isChecked = value === option.value
        const isDisabled = disabled || option.disabled

        if (listStyle) {
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !isDisabled && onChange(option.value)}
              className={cn(
                'flex items-center justify-between w-full px-4 py-3 text-left',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              style={{
                backgroundColor: colors.surface,
                borderBottomWidth: index < options.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
              disabled={isDisabled}
            >
              <div className="flex-1">
                <div style={{ color: colors.text }}>{option.label}</div>
                {option.description && (
                  <div className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                    {option.description}
                  </div>
                )}
              </div>
              <Radio
                checked={isChecked}
                onChange={() => onChange(option.value)}
                disabled={isDisabled}
              />
            </button>
          )
        }

        return (
          <div
            key={option.value}
            className={cn(
              direction === 'vertical' && 'py-2'
            )}
          >
            <Radio
              checked={isChecked}
              onChange={() => onChange(option.value)}
              disabled={isDisabled}
              label={option.label}
            />
            {option.description && (
              <div
                className="text-sm ml-8 mt-0.5"
                style={{ color: colors.textSecondary }}
              >
                {option.description}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

RadioGroup.displayName = 'RadioGroup'
