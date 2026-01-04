import React, { useState, useEffect, useRef } from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

// Currency symbols and formatting
const CURRENCIES: Record<string, { symbol: string; position: 'before' | 'after'; decimals: number }> = {
  USD: { symbol: '$', position: 'before', decimals: 2 },
  EUR: { symbol: '€', position: 'after', decimals: 2 },
  GBP: { symbol: '£', position: 'before', decimals: 2 },
  RUB: { symbol: '₽', position: 'after', decimals: 2 },
  JPY: { symbol: '¥', position: 'before', decimals: 0 },
  CNY: { symbol: '¥', position: 'before', decimals: 2 },
  KRW: { symbol: '₩', position: 'before', decimals: 0 },
  INR: { symbol: '₹', position: 'before', decimals: 2 },
  BRL: { symbol: 'R$', position: 'before', decimals: 2 },
  KZT: { symbol: '₸', position: 'after', decimals: 2 },
  UAH: { symbol: '₴', position: 'after', decimals: 2 },
}

export function formatCurrency(
  value: number,
  currency: string = 'USD',
  options?: { showSymbol?: boolean; compact?: boolean }
): string {
  const config = CURRENCIES[currency] || CURRENCIES.USD
  const { showSymbol = true, compact = false } = options || {}

  let formatted: string

  if (compact && value >= 1000) {
    if (value >= 1000000000) {
      formatted = (value / 1000000000).toFixed(1) + 'B'
    } else if (value >= 1000000) {
      formatted = (value / 1000000).toFixed(1) + 'M'
    } else if (value >= 1000) {
      formatted = (value / 1000).toFixed(1) + 'K'
    } else {
      formatted = value.toFixed(config.decimals)
    }
  } else {
    formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    })
  }

  if (!showSymbol) return formatted

  return config.position === 'before'
    ? `${config.symbol}${formatted}`
    : `${formatted} ${config.symbol}`
}

export interface CurrencyInputProps {
  value: number | null | undefined
  onChange: (value: number) => void
  currency?: string
  label?: string
  error?: string
  placeholder?: string
  min?: number
  max?: number
  disabled?: boolean
  /** Show currency selector */
  showCurrencySelector?: boolean
  /** Available currencies */
  currencies?: string[]
  onCurrencyChange?: (currency: string) => void
  className?: string
}

export function CurrencyInput({
  value,
  onChange,
  currency = 'USD',
  label,
  error,
  placeholder = '0.00',
  min,
  max,
  disabled = false,
  showCurrencySelector = false,
  currencies = ['USD', 'EUR', 'GBP', 'RUB'],
  onCurrencyChange,
  className,
}: CurrencyInputProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const inputRef = useRef<HTMLInputElement>(null)
  const selectorRef = useRef<HTMLDivElement>(null)
  const config = CURRENCIES[currency] || CURRENCIES.USD
  const [selectorOpen, setSelectorOpen] = useState(false)

  // Close currency selector on outside click
  useEffect(() => {
    if (!selectorOpen) return
    const handleClick = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setSelectorOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [selectorOpen])

  const [displayValue, setDisplayValue] = useState(() => {
    if (value === null || value === undefined || value === 0) return ''
    return value.toFixed(config.decimals)
  })

  useEffect(() => {
    if (value === null || value === undefined || value === 0) {
      setDisplayValue('')
    } else {
      setDisplayValue(value.toFixed(config.decimals))
    }
  }, [value, config.decimals])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    setDisplayValue(raw)

    const parsed = parseFloat(raw) || 0
    let finalValue = parsed

    if (min !== undefined && parsed < min) finalValue = min
    if (max !== undefined && parsed > max) finalValue = max

    onChange(finalValue)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (displayValue === '') {
      onChange(0)
    } else {
      const parsed = parseFloat(displayValue) || 0
      setDisplayValue(parsed.toFixed(config.decimals))
    }
    if (!error) {
      e.currentTarget.style.borderColor = colors.border
    }
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

      <div className="relative flex items-center">
        {/* Currency symbol/selector */}
        {config.position === 'before' && (
          showCurrencySelector ? (
            <div ref={selectorRef} className="absolute left-0 z-20">
              <button
                type="button"
                onClick={() => !disabled && setSelectorOpen(!selectorOpen)}
                disabled={disabled}
                className="h-full px-3 font-medium flex items-center gap-1"
                style={{
                  color: colors.textSecondary,
                  height: isIOS ? 44 : 48,
                  borderRightWidth: 1,
                  borderRightColor: colors.border,
                }}
              >
                {CURRENCIES[currency]?.symbol || currency}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
              {selectorOpen && (
                <div
                  className="absolute top-full left-0 mt-1 min-w-[80px] shadow-lg overflow-hidden"
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: isIOS ? 10 : 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  {currencies.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        onCurrencyChange?.(c)
                        setSelectorOpen(false)
                      }}
                      className={cn(
                        'w-full px-3 py-2 text-left font-medium',
                        c === currency && 'font-semibold'
                      )}
                      style={{
                        color: c === currency ? colors.primary : colors.text,
                        backgroundColor: c === currency ? `${colors.primary}10` : 'transparent',
                      }}
                    >
                      {CURRENCIES[c]?.symbol || c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              className="absolute left-3 font-medium"
              style={{ color: colors.textSecondary }}
            >
              {config.symbol}
            </div>
          )
        )}

        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full transition-colors focus:outline-none',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          style={{
            height: isIOS ? 44 : 48,
            paddingLeft: config.position === 'before' ? (showCurrencySelector ? 60 : 32) : 14,
            paddingRight: config.position === 'after' ? (showCurrencySelector ? 60 : 32) : 14,
            fontSize: 16,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: isIOS ? 10 : 8,
            color: colors.text,
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = colors.primary
            }
          }}
        />

        {/* Currency symbol/selector after */}
        {config.position === 'after' && (
          showCurrencySelector ? (
            <div ref={config.position === 'after' ? selectorRef : undefined} className="absolute right-0 z-20">
              <button
                type="button"
                onClick={() => !disabled && setSelectorOpen(!selectorOpen)}
                disabled={disabled}
                className="h-full px-3 font-medium flex items-center gap-1"
                style={{
                  color: colors.textSecondary,
                  height: isIOS ? 44 : 48,
                  borderLeftWidth: 1,
                  borderLeftColor: colors.border,
                }}
              >
                {CURRENCIES[currency]?.symbol || currency}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
              {selectorOpen && (
                <div
                  className="absolute top-full right-0 mt-1 min-w-[80px] shadow-lg overflow-hidden"
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: isIOS ? 10 : 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  {currencies.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        onCurrencyChange?.(c)
                        setSelectorOpen(false)
                      }}
                      className={cn(
                        'w-full px-3 py-2 text-left font-medium',
                        c === currency && 'font-semibold'
                      )}
                      style={{
                        color: c === currency ? colors.primary : colors.text,
                        backgroundColor: c === currency ? `${colors.primary}10` : 'transparent',
                      }}
                    >
                      {CURRENCIES[c]?.symbol || c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              className="absolute right-3 font-medium"
              style={{ color: colors.textSecondary }}
            >
              {config.symbol}
            </div>
          )
        )}
      </div>

      {error && (
        <p className="text-sm" style={{ color: colors.danger }}>
          {error}
        </p>
      )}
    </div>
  )
}

CurrencyInput.displayName = 'CurrencyInput'

// Price Range component
export interface PriceRangeProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  currency?: string
  label?: string
  step?: number
  /** Show input fields */
  showInputs?: boolean
  /** Format display values */
  formatValue?: (value: number) => string
  disabled?: boolean
  className?: string
}

export function PriceRange({
  min,
  max,
  value,
  onChange,
  currency = 'USD',
  label,
  step = 1,
  showInputs = true,
  formatValue,
  disabled = false,
  className,
}: PriceRangeProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const trackRef = useRef<HTMLDivElement>(null)

  const [dragging, setDragging] = useState<'min' | 'max' | null>(null)
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const format = (v: number) => {
    if (formatValue) return formatValue(v)
    return formatCurrency(v, currency, { compact: true })
  }

  const getPercent = (v: number) => ((v - min) / (max - min)) * 100

  const handleTrackClick = (e: React.MouseEvent) => {
    if (disabled || !trackRef.current) return

    const rect = trackRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const clickValue = min + percent * (max - min)

    // Determine which handle to move
    const distToMin = Math.abs(clickValue - localValue[0])
    const distToMax = Math.abs(clickValue - localValue[1])

    if (distToMin < distToMax) {
      const newMin = Math.min(Math.round(clickValue / step) * step, localValue[1])
      onChange([newMin, localValue[1]])
    } else {
      const newMax = Math.max(Math.round(clickValue / step) * step, localValue[0])
      onChange([localValue[0], newMax])
    }
  }

  const handleMouseDown = (handle: 'min' | 'max') => (e: React.MouseEvent) => {
    if (disabled) return
    e.stopPropagation()
    setDragging(handle)

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const newValue = Math.round((min + percent * (max - min)) / step) * step

      setLocalValue((prev) => {
        if (handle === 'min') {
          return [Math.min(newValue, prev[1] - step), prev[1]]
        } else {
          return [prev[0], Math.max(newValue, prev[0] + step)]
        }
      })
    }

    const handleMouseUp = () => {
      setDragging(null)
      onChange(localValue)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleInputChange = (which: 'min' | 'max', inputValue: string) => {
    const parsed = parseFloat(inputValue) || 0
    if (which === 'min') {
      const newMin = Math.max(min, Math.min(parsed, localValue[1] - step))
      onChange([newMin, localValue[1]])
    } else {
      const newMax = Math.min(max, Math.max(parsed, localValue[0] + step))
      onChange([localValue[0], newMax])
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
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

      {/* Range slider */}
      <div
        ref={trackRef}
        className={cn(
          'relative h-6 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={handleTrackClick}
      >
        {/* Track background */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 rounded-full"
          style={{ backgroundColor: colors.surfaceSecondary }}
        />

        {/* Active track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full"
          style={{
            left: `${getPercent(localValue[0])}%`,
            right: `${100 - getPercent(localValue[1])}%`,
            backgroundColor: colors.primary,
          }}
        />

        {/* Min handle */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full cursor-grab shadow-md transition-transform',
            dragging === 'min' && 'scale-110 cursor-grabbing'
          )}
          style={{
            left: `${getPercent(localValue[0])}%`,
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.primary,
          }}
          onMouseDown={handleMouseDown('min')}
        />

        {/* Max handle */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full cursor-grab shadow-md transition-transform',
            dragging === 'max' && 'scale-110 cursor-grabbing'
          )}
          style={{
            left: `${getPercent(localValue[1])}%`,
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.primary,
          }}
          onMouseDown={handleMouseDown('max')}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-sm" style={{ color: colors.textSecondary }}>
        <span>{format(localValue[0])}</span>
        <span>{format(localValue[1])}</span>
      </div>

      {/* Input fields */}
      {showInputs && (
        <div className="flex gap-3 items-center">
          <input
            type="number"
            value={localValue[0]}
            onChange={(e) => handleInputChange('min', e.target.value)}
            min={min}
            max={localValue[1] - step}
            step={step}
            disabled={disabled}
            className="flex-1 text-center transition-colors focus:outline-none"
            style={{
              height: isIOS ? 36 : 40,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: isIOS ? 8 : 4,
              color: colors.text,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border
            }}
          />
          <span style={{ color: colors.textSecondary }}>—</span>
          <input
            type="number"
            value={localValue[1]}
            onChange={(e) => handleInputChange('max', e.target.value)}
            min={localValue[0] + step}
            max={max}
            step={step}
            disabled={disabled}
            className="flex-1 text-center transition-colors focus:outline-none"
            style={{
              height: isIOS ? 36 : 40,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: isIOS ? 8 : 4,
              color: colors.text,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border
            }}
          />
        </div>
      )}
    </div>
  )
}

PriceRange.displayName = 'PriceRange'

// Export helper
export { CURRENCIES }

/**
 * AmountInput - Simplified currency input
 *
 * Alias for CurrencyInput with a simpler API for common use cases.
 *
 * @example
 * ```tsx
 * <AmountInput
 *   value={price}
 *   onChange={setPrice}
 *   currency="RUB"
 * />
 * ```
 */
export interface AmountInputProps {
  value: number | null | undefined
  onChange: (value: number) => void
  currency?: string
  label?: string
  error?: string
  placeholder?: string
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

export function AmountInput({
  value,
  onChange,
  currency = 'RUB',
  label,
  error,
  placeholder,
  min,
  max,
  disabled,
  className,
}: AmountInputProps) {
  return (
    <CurrencyInput
      value={value}
      onChange={onChange}
      currency={currency}
      label={label}
      error={error}
      placeholder={placeholder}
      min={min}
      max={max}
      disabled={disabled}
      showCurrencySelector={false}
      className={className}
    />
  )
}

AmountInput.displayName = 'AmountInput'
