import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Label text */
  label?: string
  /** Error message */
  error?: string
  /** Helper text */
  helper?: string
  /** Character count */
  maxLength?: number
  showCount?: boolean
  /** Auto-resize height */
  autoResize?: boolean
  /** Number of visible rows */
  rows?: number
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helper,
      maxLength,
      showCount = false,
      autoResize = false,
      rows = 4,
      className,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const { platform, colors } = useTheme()
    const isIOS = platform === 'ios'
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    const currentLength = typeof value === 'string' ? value.length : 0

    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, [value, autoResize])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
      onChange?.(e)
    }

    const setRefs = (el: HTMLTextAreaElement | null) => {
      textareaRef.current = el
      if (typeof ref === 'function') {
        ref(el)
      } else if (ref) {
        ref.current = el
      }
    }

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            className="text-sm font-medium"
            style={{ color: colors.text }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={setRefs}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          rows={autoResize ? 1 : rows}
          className={cn(
            'w-full px-4 py-3 resize-none transition-colors',
            'focus:outline-none',
            'placeholder:text-gray-400',
            isIOS ? 'rounded-xl' : 'rounded-lg',
            props.disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          style={{
            backgroundColor: colors.surface,
            color: colors.text,
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            minHeight: autoResize ? undefined : rows * 24 + 24,
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
        {/* Only show error/helper if label exists (not inside FormField) */}
        {(label && (error || helper)) || showCount ? (
          <div className="flex justify-between">
            {label && error ? (
              <p className="text-sm" style={{ color: colors.danger }}>{error}</p>
            ) : label && helper ? (
              <p className="text-sm" style={{ color: colors.textSecondary }}>{helper}</p>
            ) : (
              <span />
            )}
            {showCount && (
              <span
                className="text-xs"
                style={{
                  color: maxLength && currentLength >= maxLength
                    ? colors.danger
                    : colors.textSecondary,
                }}
              >
                {currentLength}{maxLength ? `/${maxLength}` : ''}
              </span>
            )}
          </div>
        ) : null}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
