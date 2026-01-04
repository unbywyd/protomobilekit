import React, { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '../../ui/utils'
import { useTheme } from '../../ui/theme'

export interface OTPInputProps {
  /** OTP value */
  value: string
  /** Change handler */
  onChange: (value: string) => void
  /** Number of digits */
  length?: number
  /** Auto submit when complete */
  onComplete?: (value: string) => void
  /** Error state */
  error?: string | null
  /** Disabled state */
  disabled?: boolean
  /** Auto focus first input */
  autoFocus?: boolean
  /** Secure input (dots instead of digits) */
  secure?: boolean
  /** Input type */
  type?: 'numeric' | 'alphanumeric'
  className?: string
}

/**
 * OTPInput - One-time password input with auto-focus
 *
 * @example
 * ```tsx
 * <OTPInput
 *   value={code}
 *   onChange={setCode}
 *   length={6}
 *   onComplete={(code) => verifyCode(code)}
 * />
 * ```
 */
export function OTPInput({
  value,
  onChange,
  length = 6,
  onComplete,
  error,
  disabled = false,
  autoFocus = true,
  secure = false,
  type = 'numeric',
  className,
}: OTPInputProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  // Split value into array of characters
  const chars = value.split('').slice(0, length)

  // Focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  // Call onComplete when filled
  useEffect(() => {
    if (chars.length === length && onComplete) {
      onComplete(value)
    }
  }, [chars.length, length, onComplete, value])

  const focusInput = (index: number) => {
    if (index >= 0 && index < length && inputRefs.current[index]) {
      inputRefs.current[index]?.focus()
      setActiveIndex(index)
    }
  }

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      // Get only allowed characters
      const pattern = type === 'numeric' ? /\d/ : /[a-zA-Z0-9]/
      const char = inputValue.split('').find((c) => pattern.test(c))

      if (!char) return

      // Update value
      const newChars = [...chars]
      newChars[index] = char.toUpperCase()
      const newValue = newChars.join('')
      onChange(newValue)

      // Move to next input
      if (index < length - 1) {
        focusInput(index + 1)
      }
    },
    [chars, length, onChange, type]
  )

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Backspace':
        e.preventDefault()
        if (chars[index]) {
          // Clear current
          const newChars = [...chars]
          newChars[index] = ''
          onChange(newChars.join(''))
        } else if (index > 0) {
          // Move to previous and clear
          const newChars = [...chars]
          newChars[index - 1] = ''
          onChange(newChars.join(''))
          focusInput(index - 1)
        }
        break

      case 'ArrowLeft':
        e.preventDefault()
        focusInput(index - 1)
        break

      case 'ArrowRight':
        e.preventDefault()
        focusInput(index + 1)
        break

      case 'Delete':
        e.preventDefault()
        const newChars = [...chars]
        newChars[index] = ''
        onChange(newChars.join(''))
        break
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const pattern = type === 'numeric' ? /\d/g : /[a-zA-Z0-9]/g
    const matches = pasted.match(pattern)

    if (matches) {
      const newValue = matches.slice(0, length).join('').toUpperCase()
      onChange(newValue)
      focusInput(Math.min(newValue.length, length - 1))
    }
  }

  const handleFocus = (index: number) => {
    setActiveIndex(index)
    // Select content on focus
    inputRefs.current[index]?.select()
  }

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {Array.from({ length }).map((_, index) => {
        const char = chars[index] || ''
        const isFilled = !!char
        const isActive = activeIndex === index

        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type={secure ? 'password' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            pattern={type === 'numeric' ? '[0-9]*' : '[a-zA-Z0-9]*'}
            maxLength={1}
            value={secure && char ? '•' : char}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={cn(
              'text-center font-semibold transition-all',
              'focus:outline-none',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{
              width: isIOS ? 44 : 48,
              height: isIOS ? 52 : 56,
              fontSize: 24,
              backgroundColor: colors.surface,
              borderWidth: 2,
              borderColor: error
                ? colors.danger
                : isActive
                ? colors.primary
                : isFilled
                ? colors.border
                : colors.border,
              borderRadius: isIOS ? 10 : 8,
              color: colors.text,
            }}
          />
        )
      })}
    </div>
  )
}

OTPInput.displayName = 'OTPInput'
