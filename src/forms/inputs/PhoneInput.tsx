import React, { useState, useEffect } from 'react'
import { cn } from '../../ui/utils'
import { useTheme } from '../../ui/theme'

// Phone country codes
const COUNTRIES = [
  { code: 'GB', dial: '+44', mask: '#### ######', flag: '🇬🇧' },
  { code: 'IL', dial: '+972', mask: '##-###-####', flag: '🇮🇱' },
  { code: 'US', dial: '+1', mask: '(###) ###-####', flag: '🇺🇸' },
]

// Parse full phone number and detect country code
function parseFullPhoneNumber(input: string): { country: typeof COUNTRIES[0] | null; localNumber: string } {
  const cleaned = input.replace(/[\s\-\(\)]/g, '')

  // Check if starts with + and try to match country codes (longest first)
  if (cleaned.startsWith('+')) {
    // Sort by dial code length (longest first) to match +972 before +9
    const sortedCountries = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)

    for (const country of sortedCountries) {
      if (cleaned.startsWith(country.dial)) {
        return {
          country,
          localNumber: cleaned.slice(country.dial.length),
        }
      }
    }
  }

  return { country: null, localNumber: cleaned.replace(/^\+/, '') }
}

export interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  /** Default country code */
  defaultCountry?: string
  /** Show country selector */
  showCountrySelector?: boolean
  /** Placeholder */
  placeholder?: string
  /** Error state */
  error?: string | null
  /** Disabled state */
  disabled?: boolean
  /** Auto focus */
  autoFocus?: boolean
  className?: string
}

/**
 * PhoneInput - Phone number input with mask and country selector
 *
 * @example
 * ```tsx
 * <PhoneInput
 *   value={phone}
 *   onChange={setPhone}
 *   defaultCountry="RU"
 * />
 * ```
 */
export function PhoneInput({
  value,
  onChange,
  defaultCountry = 'GB',
  showCountrySelector = true,
  placeholder,
  error,
  disabled = false,
  autoFocus = false,
  className,
}: PhoneInputProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  const [country, setCountry] = useState(() =>
    COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0]
  )
  const [showPicker, setShowPicker] = useState(false)

  // Format phone number with mask
  const formatPhone = (input: string, mask: string): string => {
    const digits = input.replace(/\D/g, '')
    let result = ''
    let digitIndex = 0

    for (const char of mask) {
      if (digitIndex >= digits.length) break
      if (char === '#') {
        result += digits[digitIndex]
        digitIndex++
      } else {
        result += char
      }
    }

    return result
  }

  // Extract digits from formatted value
  const getDigits = (formatted: string): string => {
    return formatted.replace(/\D/g, '')
  }

  // Get display value (formatted)
  const displayValue = value.startsWith(country.dial)
    ? formatPhone(value.slice(country.dial.length), country.mask)
    : formatPhone(value, country.mask)

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const digits = getDigits(input)
    const fullNumber = country.dial + digits
    onChange(fullNumber)
  }

  // Handle paste - auto-detect country code from pasted number
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')

    // Only process if pasted text looks like a full phone number with country code
    if (pastedText.includes('+')) {
      e.preventDefault()
      const { country: detectedCountry, localNumber } = parseFullPhoneNumber(pastedText)

      if (detectedCountry) {
        setCountry(detectedCountry)
        onChange(detectedCountry.dial + localNumber)
      } else {
        // Unknown country code - keep current country, just use the number
        const digits = pastedText.replace(/\D/g, '')
        onChange(country.dial + digits)
      }
    }
  }

  // Handle country change
  const handleCountryChange = (newCountry: typeof country) => {
    setCountry(newCountry)
    setShowPicker(false)
    // Re-format with new country code
    const digits = getDigits(value.replace(/^\+\d+/, ''))
    onChange(newCountry.dial + digits)
  }

  const defaultPlaceholder = formatPhone('0'.repeat(10), country.mask)

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center transition-all',
          disabled && 'opacity-50'
        )}
        style={{
          height: isIOS ? 44 : 48,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: isIOS ? 10 : 8,
        }}
      >
        {/* Country selector */}
        {showCountrySelector && (
          <button
            type="button"
            onClick={() => !disabled && setShowPicker(!showPicker)}
            disabled={disabled}
            className="flex items-center gap-1 px-3 shrink-0"
            style={{
              borderRightWidth: 1,
              borderRightColor: colors.border,
              height: '100%',
            }}
          >
            <span className="text-lg">{country.flag}</span>
            <span className="text-sm" style={{ color: colors.textSecondary }}>
              {country.dial}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill={colors.textSecondary}
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        )}

        {/* Phone input */}
        <input
          type="tel"
          inputMode="tel"
          value={displayValue}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder={placeholder || defaultPlaceholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            'flex-1 h-full bg-transparent px-3',
            'focus:outline-none',
            className
          )}
          style={{
            color: colors.text,
            fontSize: 16,
          }}
        />
      </div>

      {/* Country picker dropdown */}
      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />
          <div
            className="absolute left-0 top-full mt-1 z-50 py-1 shadow-lg overflow-y-auto max-h-60"
            style={{
              backgroundColor: colors.surface,
              borderRadius: isIOS ? 10 : 8,
              borderWidth: 1,
              borderColor: colors.border,
              minWidth: 200,
            }}
          >
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleCountryChange(c)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left',
                  c.code === country.code && 'bg-opacity-10'
                )}
                style={{
                  backgroundColor: c.code === country.code ? colors.primary + '20' : 'transparent',
                }}
              >
                <span className="text-xl">{c.flag}</span>
                <span style={{ color: colors.text }}>{c.dial}</span>
                <span className="text-sm" style={{ color: colors.textSecondary }}>
                  {c.code}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

PhoneInput.displayName = 'PhoneInput'
