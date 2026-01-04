import React, { useState, useEffect } from 'react'
import { cn } from '../../ui/utils'
import { useTheme } from '../../ui/theme'

export interface PinInputProps {
  /** PIN value */
  value: string
  /** Change handler */
  onChange: (value: string) => void
  /** Number of digits */
  length?: number
  /** Auto submit when complete */
  onComplete?: (value: string) => void
  /** Error state (shakes input) */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Disabled state */
  disabled?: boolean
  /** Title text */
  title?: string
  /** Subtitle text */
  subtitle?: string
  className?: string
}

/**
 * PinInput - PIN code input with numpad
 *
 * @example
 * ```tsx
 * <PinInput
 *   value={pin}
 *   onChange={setPin}
 *   length={4}
 *   title="Enter PIN"
 *   onComplete={(pin) => checkPin(pin)}
 * />
 * ```
 */
export function PinInput({
  value,
  onChange,
  length = 4,
  onComplete,
  error = false,
  errorMessage,
  disabled = false,
  title,
  subtitle,
  className,
}: PinInputProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const [shake, setShake] = useState(false)

  // Trigger shake animation on error
  useEffect(() => {
    if (error) {
      setShake(true)
      const timer = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Call onComplete when filled
  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value)
    }
  }, [value, length, onComplete])

  const handleKeyPress = (key: string) => {
    if (disabled) return

    if (key === 'delete') {
      onChange(value.slice(0, -1))
    } else if (value.length < length) {
      onChange(value + key)
    }
  }

  // Numpad keys
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete'],
  ]

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Title */}
      {title && (
        <h2
          className={cn('font-semibold mb-2', isIOS ? 'text-xl' : 'text-lg')}
          style={{ color: colors.text }}
        >
          {title}
        </h2>
      )}

      {/* Subtitle / Error message */}
      {(subtitle || errorMessage) && (
        <p
          className="text-sm mb-6"
          style={{ color: error && errorMessage ? colors.danger : colors.textSecondary }}
        >
          {error && errorMessage ? errorMessage : subtitle}
        </p>
      )}

      {/* PIN dots */}
      <div
        className={cn(
          'flex gap-4 mb-8',
          shake && 'animate-shake'
        )}
        style={{
          // CSS animation for shake
          animation: shake ? 'shake 0.5s ease-in-out' : undefined,
        }}
      >
        {Array.from({ length }).map((_, index) => {
          const isFilled = index < value.length

          return (
            <div
              key={index}
              className="rounded-full transition-all duration-200"
              style={{
                width: isIOS ? 14 : 16,
                height: isIOS ? 14 : 16,
                backgroundColor: isFilled
                  ? error
                    ? colors.danger
                    : colors.primary
                  : 'transparent',
                borderWidth: 2,
                borderColor: error ? colors.danger : isFilled ? colors.primary : colors.border,
              }}
            />
          )
        })}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4" style={{ width: 280 }}>
        {keys.flat().map((key, index) => {
          if (key === '') {
            return <div key={`empty-${index}`} />
          }

          const isDelete = key === 'delete'

          return (
            <button
              key={`key-${key}`}
              type="button"
              onClick={() => handleKeyPress(key)}
              disabled={disabled || (value.length === 0 && isDelete)}
              className={cn(
                'flex items-center justify-center rounded-full transition-all',
                'active:scale-95 active:opacity-70',
                'disabled:opacity-30'
              )}
              style={{
                width: 72,
                height: 72,
                backgroundColor: isDelete ? 'transparent' : colors.surfaceSecondary,
                color: colors.text,
              }}
            >
              {isDelete ? (
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              ) : (
                <span className="text-2xl font-medium">{key}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Shake animation keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  )
}

PinInput.displayName = 'PinInput'
