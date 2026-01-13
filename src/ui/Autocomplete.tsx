import React, { useState, useMemo, useEffect, useRef } from 'react'
import { cn } from './utils'
import { useTheme } from './theme'
import { useLocale } from './locale'
import { useQuery } from '../core/hooks'
import { BottomSheet } from './BottomSheet'
import { SearchBar } from './SearchBar'
import type { Entity } from '../core/types'

export interface AutocompleteOption<T = any> {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  data?: T
}

export interface AutocompleteProps<T extends Entity = Entity> {
  /** Collection name to search */
  collection: string
  /** Get option value from entity */
  getOptionValue: (entity: T) => string
  /** Get option label from entity */
  getOptionLabel: (entity: T) => string
  /** Get option description from entity (optional) */
  getOptionDescription?: (entity: T) => string | undefined
  /** Get option icon from entity (optional) */
  getOptionIcon?: (entity: T) => React.ReactNode | undefined
  /** Current value(s) */
  value: string | string[]
  /** Change handler */
  onChange: (value: string | string[]) => void
  /** Placeholder text */
  placeholder?: string
  /** Label */
  label?: string
  /** Error message */
  error?: string
  /** Disabled state */
  disabled?: boolean
  /** Allow multiple selection */
  multiple?: boolean
  /** Search filter function */
  filter?: (entity: T, search: string) => boolean
  /** Custom search placeholder */
  searchPlaceholder?: string
  /** Empty state text */
  emptyText?: string
  /** Done button text (for multiple selection) */
  doneText?: string
  /** Maximum results to show */
  maxResults?: number
  /** Custom render for selected value */
  renderValue?: (selected: AutocompleteOption<T> | AutocompleteOption<T>[]) => React.ReactNode
  className?: string
}

export function Autocomplete<T extends Entity = Entity>({
  collection,
  getOptionValue,
  getOptionLabel,
  getOptionDescription,
  getOptionIcon,
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  multiple = false,
  filter,
  searchPlaceholder,
  emptyText,
  doneText,
  maxResults = 50,
  renderValue,
  className,
}: AutocompleteProps<T>) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const optionsContainerRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)

  // Get all entities from collection
  const { items: allItems } = useQuery<T>(collection)

  // Convert entities to options
  const allOptions = useMemo(() => {
    return allItems.map((item) => ({
      value: getOptionValue(item),
      label: getOptionLabel(item),
      description: getOptionDescription?.(item),
      icon: getOptionIcon?.(item),
      data: item,
    }))
  }, [allItems, getOptionValue, getOptionLabel, getOptionDescription, getOptionIcon])

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search.trim()) {
      return allOptions.slice(0, maxResults)
    }

    const lowerSearch = search.toLowerCase()
    let filtered = allOptions

    if (filter) {
      // Use custom filter function
      filtered = allOptions.filter((opt) => filter(opt.data!, search))
    } else {
      // Default: search in label and description
      filtered = allOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(lowerSearch) ||
          opt.description?.toLowerCase().includes(lowerSearch)
      )
    }

    return filtered.slice(0, maxResults)
  }, [allOptions, search, filter, maxResults])

  // Get selected options
  const selectedValues = Array.isArray(value) ? value : value ? [value] : []
  const selectedOptions = allOptions.filter((o) => selectedValues.includes(o.value))

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue]
      onChange(newValues)
    } else {
      onChange(optionValue)
      setOpen(false)
      setSearch('')
    }
  }

  const handleInputClick = () => {
    if (!disabled) {
      setOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
    if (!multiple) {
      setSearch('')
    }
  }

  // Handle keyboard and viewport management
  useEffect(() => {
    if (!open) {
      if (!multiple) {
        setSearch('')
      }
      return
    }

    // Focus search input when BottomSheet opens
    const focusTimer = setTimeout(() => {
      const input = searchBarRef.current?.querySelector('input')
      input?.focus()
    }, 150)

    // Handle visual viewport changes (keyboard open/close)
    // Only handle if this instance's BottomSheet is open
    const handleViewportChange = () => {
      // Check if BottomSheet is still open for this instance
      if (!open || !window.visualViewport || !optionsContainerRef.current) return
      
      const viewportHeight = window.visualViewport.height
      const viewportDiff = window.innerHeight - viewportHeight
      
      // If keyboard is open (viewport is smaller), adjust container height
      if (viewportDiff > 150) {
        // Keyboard is likely open
        const availableHeight = viewportHeight - 180 // Account for header + search
        optionsContainerRef.current.style.maxHeight = `${Math.max(200, availableHeight)}px`
      } else {
        // Keyboard closed, use default
        optionsContainerRef.current.style.maxHeight = ''
      }
    }

    if (open && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      // Initial check
      handleViewportChange()
    }

    return () => {
      clearTimeout(focusTimer)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange)
      }
    }
  }, [open, multiple])

  // Scroll to top when search changes
  useEffect(() => {
    if (!open || !optionsContainerRef.current) return
    const timer = setTimeout(() => {
      optionsContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
    return () => clearTimeout(timer)
  }, [search, open])

  const getDisplayValue = (): string => {
    if (selectedOptions.length === 0) {
      return search || placeholder || locale.select
    }
    if (multiple) {
      return `${locale.selected} (${selectedOptions.length})`
    }
    return selectedOptions[0].label
  }

  const getPlaceholderText = (): string => {
    if (selectedOptions.length > 0 && !search) {
      if (multiple) {
        return `${locale.selected} (${selectedOptions.length})`
      }
      return selectedOptions[0].label
    }
    return placeholder || locale.select
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

      {/* Trigger button */}
      <button
        type="button"
        onClick={handleInputClick}
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
        <span className="flex-1 truncate">{getPlaceholderText()}</span>
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
        <p className="text-sm" style={{ color: colors.danger }}>{error}</p>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        open={open}
        onClose={handleClose}
        title={label || placeholder}
        height="full"
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Search - fixed at top */}
          <div ref={searchBarRef} className="shrink-0 px-4 py-2 border-b" style={{ borderColor: colors.border }}>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={searchPlaceholder || locale.search}
              autoFocus
              onCancel={handleClose}
            />
          </div>

          {/* Options - scrollable, takes remaining space */}
          <div ref={optionsContainerRef} className="flex-1 overflow-y-auto min-h-0">
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
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left',
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
                  color: colors.primaryText,
                }}
              >
                {doneText || locale.done} ({selectedValues.length})
              </button>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  )
}

Autocomplete.displayName = 'Autocomplete'

