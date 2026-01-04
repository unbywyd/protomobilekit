import React, { useState, useRef } from 'react'
import { cn } from './utils'
import { useTheme } from './theme'
import { useLocale } from './locale'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Show cancel button when focused */
  showCancel?: boolean
  /** Cancel button text */
  cancelText?: string
  onFocus?: () => void
  onBlur?: () => void
  onSubmit?: (value: string) => void
  onCancel?: () => void
  autoFocus?: boolean
  className?: string
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChange,
      placeholder,
      showCancel = false,
      cancelText,
      onFocus,
      onBlur,
      onSubmit,
      onCancel,
      autoFocus = false,
      className,
    },
    ref
  ) => {
    const { platform, colors } = useTheme()
    const isIOS = platform === 'ios'
    const locale = useLocale()
    const [focused, setFocused] = useState(false)
    const internalRef = useRef<HTMLInputElement>(null)
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef

  const handleFocus = () => {
    setFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setFocused(false)
    onBlur?.()
  }

  const handleCancel = () => {
    onChange('')
    setFocused(false)
    inputRef.current?.blur()
    onCancel?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit?.(value)
    }
  }

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Search input container */}
      <div
        className={cn(
          'flex-1 flex items-center gap-2 px-3',
          isIOS ? 'h-9 rounded-[10px]' : 'h-12 rounded-full'
        )}
        style={{
          backgroundColor: isIOS
            ? 'rgba(118, 118, 128, 0.12)'
            : colors.surfaceSecondary,
        }}
      >
        {/* Search icon */}
        <svg
          width={isIOS ? 16 : 20}
          height={isIOS ? 16 : 20}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.textSecondary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className={cn(
            'flex-1 bg-transparent outline-none',
            isIOS ? 'text-[17px]' : 'text-base'
          )}
          style={{
            color: colors.text,
          }}
        />

        {/* Clear button */}
        {value && (
          <button
            onClick={handleClear}
            className="p-0.5 rounded-full"
            style={{
              backgroundColor: isIOS ? 'rgba(118, 118, 128, 0.4)' : undefined,
            }}
          >
            <svg
              width={isIOS ? 14 : 18}
              height={isIOS ? 14 : 18}
              viewBox="0 0 24 24"
              fill={isIOS ? '#FFFFFF' : colors.textSecondary}
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </div>

      {/* Cancel button (iOS style) */}
      {showCancel && focused && isIOS && (
        <button
          onClick={handleCancel}
          className="text-[17px] shrink-0"
          style={{ color: colors.primary }}
        >
          {cancelText || locale.cancel}
        </button>
      )}
    </div>
  )
  }
)

SearchBar.displayName = 'SearchBar'
