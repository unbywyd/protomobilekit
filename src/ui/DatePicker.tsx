import React, { useState, useMemo } from 'react'
import { cn } from './utils'
import { useTheme } from './theme'
import { BottomSheet } from './BottomSheet'
import { useLocale } from './locale'

export interface DatePickerProps {
  open: boolean
  onClose: () => void
  value?: Date
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  title?: string
  /** Text direction for RTL support */
  dir?: 'ltr' | 'rtl'
  /** Custom cancel button text */
  cancelText?: string
  /** Custom done button text */
  doneText?: string
}

export function DatePicker({
  open,
  onClose,
  value,
  onChange,
  minDate,
  maxDate,
  title,
  dir,
  cancelText,
  doneText,
}: DatePickerProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const locale = useLocale()
  const isRTL = dir === 'rtl'

  const months = locale.months
  const monthsShort = locale.monthsShort
  const weekdays = locale.weekdaysShort

  const [viewDate, setViewDate] = useState(() => value || new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value)

  // Reset when opening
  React.useEffect(() => {
    if (open) {
      setViewDate(value || new Date())
      setSelectedDate(value)
    }
  }, [open, value])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const totalDays = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i)
    }

    return days
  }, [year, month])

  const isDateDisabled = (day: number) => {
    const date = new Date(year, month, day)
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true
    if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) return true
    return false
  }

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    )
  }

  const handleDaySelect = (day: number) => {
    if (isDateDisabled(day)) return
    const newDate = new Date(year, month, day)
    setSelectedDate(newDate)
  }

  const handleConfirm = () => {
    if (selectedDate) {
      onChange(selectedDate)
    }
    onClose()
  }

  const goToPrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  // Prev/Next icons - swap in RTL
  const PrevIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d={isRTL ? "M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" : "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"} />
    </svg>
  )

  const NextIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d={isRTL ? "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" : "M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"} />
    </svg>
  )

  return (
    <BottomSheet open={open} onClose={onClose} showHandle={!isIOS} height="auto" cancelText={cancelText}>
      <div className="pb-4" dir={dir}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          {isIOS ? (
            <>
              <button
                onClick={onClose}
                className="text-base"
                style={{ color: colors.primary }}
              >
                {cancelText || locale.cancel}
              </button>
              <span className="text-base font-semibold" style={{ color: colors.text }}>
                {title || locale.selectDate}
              </span>
              <button
                onClick={handleConfirm}
                className="text-base font-semibold"
                style={{ color: colors.primary }}
              >
                {doneText || locale.done}
              </button>
            </>
          ) : (
            <>
              <span className="text-lg font-medium" style={{ color: colors.text }}>
                {title || locale.selectDate}
              </span>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium rounded-full"
                style={{ color: colors.primary }}
              >
                {doneText || locale.ok}
              </button>
            </>
          )}
        </div>

        {/* Month/Year Navigation */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-full"
            style={{ color: colors.text }}
          >
            <PrevIcon />
          </button>
          <span className="text-base font-semibold" style={{ color: colors.text }}>
            {months[month] || ''} {year}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full"
            style={{ color: colors.text }}
          >
            <NextIcon />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 px-2">
          {weekdays.map((day, index) => (
            <div
              key={index}
              className="h-10 flex items-center justify-center text-xs font-medium"
              style={{ color: colors.textSecondary }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 px-2">
          {daysInMonth.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-10" />
            }

            const disabled = isDateDisabled(day)
            const selected = isDateSelected(day)
            const today = isToday(day)

            return (
              <button
                key={day}
                onClick={() => handleDaySelect(day)}
                disabled={disabled}
                className={cn(
                  'h-10 w-10 mx-auto flex items-center justify-center text-sm',
                  isIOS ? 'rounded-full' : 'rounded-full'
                )}
                style={{
                  backgroundColor: selected ? colors.primary : 'transparent',
                  color: selected
                    ? colors.primaryText
                    : disabled
                    ? colors.border
                    : today
                    ? colors.primary
                    : colors.text,
                  fontWeight: today || selected ? '600' : '400',
                }}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* Selected Date Display (Android) */}
        {!isIOS && selectedDate && (
          <div
            className="mx-4 mt-4 px-4 py-3 rounded-lg"
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            <div className="text-sm" style={{ color: colors.textSecondary }}>
              {locale.selected}
            </div>
            <div className="text-lg font-medium" style={{ color: colors.text }}>
              {monthsShort[selectedDate.getMonth()] || ''} {selectedDate.getDate()}, {selectedDate.getFullYear()}
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

DatePicker.displayName = 'DatePicker'

// Inline calendar for embedding
export interface CalendarProps {
  value?: Date
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  /** Text direction for RTL support */
  dir?: 'ltr' | 'rtl'
  className?: string
}

export function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  dir,
  className,
}: CalendarProps) {
  const { colors } = useTheme()
  const locale = useLocale()
  const isRTL = dir === 'rtl'

  const months = locale.months
  const weekdays = locale.weekdaysShort

  const [viewDate, setViewDate] = useState(() => value || new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const totalDays = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(i)
    }

    return days
  }, [year, month])

  const isDateDisabled = (day: number) => {
    const date = new Date(year, month, day)
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true
    if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) return true
    return false
  }

  const isDateSelected = (day: number) => {
    if (!value) return false
    return (
      value.getDate() === day &&
      value.getMonth() === month &&
      value.getFullYear() === year
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    )
  }

  // Prev/Next icons - swap in RTL
  const PrevIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d={isRTL ? "M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" : "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"} />
    </svg>
  )

  const NextIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d={isRTL ? "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" : "M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"} />
    </svg>
  )

  return (
    <div className={cn('p-2', className)} style={{ backgroundColor: colors.surface }} dir={dir}>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-2"
          style={{ color: colors.text }}
        >
          <PrevIcon />
        </button>
        <span className="text-sm font-semibold" style={{ color: colors.text }}>
          {months[month] || ''} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-2"
          style={{ color: colors.text }}
        >
          <NextIcon />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7">
        {weekdays.map((day, index) => (
          <div
            key={index}
            className="h-8 flex items-center justify-center text-xs"
            style={{ color: colors.textSecondary }}
          >
            {day.charAt(0)}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7">
        {daysInMonth.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-8" />
          }

          const disabled = isDateDisabled(day)
          const selected = isDateSelected(day)
          const today = isToday(day)

          return (
            <button
              key={day}
              onClick={() => !disabled && onChange(new Date(year, month, day))}
              disabled={disabled}
              className="h-8 w-8 mx-auto flex items-center justify-center text-xs rounded-full"
              style={{
                backgroundColor: selected ? colors.primary : 'transparent',
                color: selected
                  ? colors.primaryText
                  : disabled
                  ? colors.border
                  : today
                  ? colors.primary
                  : colors.text,
                fontWeight: today || selected ? '600' : '400',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = 'Calendar'
