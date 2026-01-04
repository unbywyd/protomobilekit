import React, { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from './utils'
import { useTheme } from './theme'
import { BottomSheet } from './BottomSheet'
import { SearchBar } from './SearchBar'
import { useLocale } from './locale'

export interface SearchableSelectOption {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface SearchableSelectProps {
  value: string | string[]
  onChange: (value: string | string[]) => void
  options: SearchableSelectOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  /** Allow multiple selection */
  multiple?: boolean
  /** Searchable */
  searchable?: boolean
  /** Search placeholder */
  searchPlaceholder?: string
  /** Custom render for selected value */
  renderValue?: (selected: SearchableSelectOption | SearchableSelectOption[]) => React.ReactNode
  /** Empty state text */
  emptyText?: string
  className?: string
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  label,
  error,
  disabled = false,
  multiple = false,
  searchable = true,
  searchPlaceholder,
  renderValue,
  emptyText,
  className,
}: SearchableSelectProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedValues = Array.isArray(value) ? value : value ? [value] : []
  const selectedOptions = options.filter((o) => selectedValues.includes(o.value))

  const filteredOptions = useMemo(() => {
    if (!search) return options
    const lowerSearch = search.toLowerCase()
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(lowerSearch) ||
        o.description?.toLowerCase().includes(lowerSearch)
    )
  }, [options, search])

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue]
      onChange(newValues)
    } else {
      onChange(optionValue)
      setOpen(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSearch('')
  }

  const getDisplayValue = () => {
    if (selectedOptions.length === 0) {
      return placeholder || locale.select
    }
    if (renderValue) {
      return renderValue(multiple ? selectedOptions : selectedOptions[0])
    }
    if (multiple) {
      return selectedOptions.map((o) => o.label).join(', ')
    }
    return selectedOptions[0].label
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

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between text-left transition-colors',
          'focus:outline-none',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        style={{
          height: isIOS ? 44 : 48,
          paddingLeft: 14,
          paddingRight: 14,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: isIOS ? 10 : 8,
          color: selectedOptions.length > 0 ? colors.text : colors.textSecondary,
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
        <span className="flex-1 truncate">{getDisplayValue()}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ color: colors.textSecondary }}
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {error && (
        <p className="text-sm" style={{ color: colors.danger }}>
          {error}
        </p>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        open={open}
        onClose={handleClose}
        title={label || placeholder}
        height="half"
      >
        <div className="flex flex-col h-full">
          {/* Search */}
          {searchable && (
            <div className="px-4 py-2">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder={searchPlaceholder || locale.search}
                autoFocus
              />
            </div>
          )}

          {/* Options */}
          <div className="flex-1 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div
                className="flex items-center justify-center py-8"
                style={{ color: colors.textSecondary }}
              >
                {emptyText || locale.noResults}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                const isDisabled = option.disabled

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !isDisabled && handleSelect(option.value)}
                    disabled={isDisabled}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                    style={{
                      backgroundColor: isSelected
                        ? `${colors.primary}15`
                        : 'transparent',
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    {option.icon && (
                      <span
                        className="shrink-0"
                        style={{ color: colors.textSecondary }}
                      >
                        {option.icon}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div
                        className="truncate"
                        style={{
                          color: isSelected ? colors.primary : colors.text,
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        {option.label}
                      </div>
                      {option.description && (
                        <div
                          className="text-sm truncate"
                          style={{ color: colors.textSecondary }}
                        >
                          {option.description}
                        </div>
                      )}
                    </div>
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
              })
            )}
          </div>

          {/* Done button for multiple */}
          {multiple && (
            <div
              className="shrink-0 px-4 py-3"
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: colors.primary,
                  color: '#FFFFFF',
                }}
              >
                {locale.done} ({selectedValues.length})
              </button>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  )
}

SearchableSelect.displayName = 'SearchableSelect'
