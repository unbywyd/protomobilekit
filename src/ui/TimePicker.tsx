import React, { useState, useRef, useEffect } from 'react'
import { cn } from './utils'
import { useTheme } from './theme'
import { BottomSheet } from './BottomSheet'
import { useLocale } from './locale'

export interface TimePickerProps {
  open: boolean
  onClose: () => void
  value?: { hours: number; minutes: number }
  onChange: (time: { hours: number; minutes: number }) => void
  /** 12 or 24 hour format */
  format?: '12' | '24'
  /** Minute step (1, 5, 10, 15, 30) */
  minuteStep?: number
  title?: string
  /** Text direction for RTL support */
  dir?: 'ltr' | 'rtl'
  /** Custom cancel button text */
  cancelText?: string
  /** Custom done button text */
  doneText?: string
}

// Wheel picker component
interface WheelProps {
  items: string[]
  selectedIndex: number
  onChange: (index: number) => void
  itemHeight?: number
}

function Wheel({ items, selectedIndex, onChange, itemHeight = 40 }: WheelProps) {
  const { colors } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (containerRef.current && !isDragging) {
      containerRef.current.scrollTop = selectedIndex * itemHeight
    }
  }, [selectedIndex, itemHeight, isDragging])

  const handleScroll = () => {
    if (!containerRef.current) return
    const scrollTop = containerRef.current.scrollTop
    const newIndex = Math.round(scrollTop / itemHeight)
    if (newIndex !== selectedIndex && newIndex >= 0 && newIndex < items.length) {
      onChange(newIndex)
    }
  }

  return (
    <div className="relative h-[200px] overflow-hidden">
      {/* Selection indicator */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{
          top: '50%',
          transform: 'translateY(-50%)',
          height: itemHeight,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      />

      {/* Gradient overlays */}
      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-20"
        style={{
          background: `linear-gradient(to bottom, ${colors.surface}, transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-20"
        style={{
          background: `linear-gradient(to top, ${colors.surface}, transparent)`,
        }}
      />

      {/* Scrollable list */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        style={{
          paddingTop: 80,
          paddingBottom: 80,
          scrollSnapType: 'y mandatory',
        }}
        onScroll={handleScroll}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-center snap-center"
            style={{
              height: itemHeight,
              color: index === selectedIndex ? colors.text : colors.textSecondary,
              fontWeight: index === selectedIndex ? '600' : '400',
              fontSize: index === selectedIndex ? '20px' : '16px',
              opacity: Math.abs(index - selectedIndex) > 2 ? 0.3 : 1,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

export function TimePicker({
  open,
  onClose,
  value,
  onChange,
  format = '12',
  minuteStep = 1,
  title,
  dir,
  cancelText,
  doneText,
}: TimePickerProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const locale = useLocale()

  const defaultValue = value || { hours: 12, minutes: 0 }
  const [hours, setHours] = useState(defaultValue.hours)
  const [minutes, setMinutes] = useState(defaultValue.minutes)
  const [period, setPeriod] = useState<'AM' | 'PM'>(defaultValue.hours >= 12 ? 'PM' : 'AM')

  // Reset when opening
  useEffect(() => {
    if (open && value) {
      setHours(value.hours)
      setMinutes(value.minutes)
      setPeriod(value.hours >= 12 ? 'PM' : 'AM')
    }
  }, [open, value])

  const hourItems = format === '12'
    ? Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
    : Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))

  const minuteItems = Array.from(
    { length: 60 / minuteStep },
    (_, i) => String(i * minuteStep).padStart(2, '0')
  )

  const getDisplayHour = () => {
    if (format === '24') return hours
    const h = hours % 12
    return h === 0 ? 12 : h
  }

  const handleConfirm = () => {
    let finalHours = hours
    if (format === '12') {
      if (period === 'AM' && hours === 12) finalHours = 0
      else if (period === 'PM' && hours !== 12) finalHours = hours + 12
    }
    onChange({ hours: finalHours, minutes })
    onClose()
  }

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
                {title || locale.selectTime}
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
                {title || locale.selectTime}
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

        {/* Wheel Pickers */}
        <div className="flex items-center justify-center px-4">
          {/* Hours */}
          <div className="w-20">
            <Wheel
              items={hourItems}
              selectedIndex={format === '12' ? getDisplayHour() - 1 : hours}
              onChange={(index) => {
                const newHour = format === '12' ? index + 1 : index
                setHours(newHour)
              }}
            />
          </div>

          {/* Separator */}
          <div
            className="text-2xl font-bold mx-2"
            style={{ color: colors.text }}
          >
            :
          </div>

          {/* Minutes */}
          <div className="w-20">
            <Wheel
              items={minuteItems}
              selectedIndex={Math.floor(minutes / minuteStep)}
              onChange={(index) => setMinutes(index * minuteStep)}
            />
          </div>

          {/* AM/PM for 12-hour format */}
          {format === '12' && (
            <div className="w-16 ml-2">
              <Wheel
                items={['AM', 'PM']}
                selectedIndex={period === 'AM' ? 0 : 1}
                onChange={(index) => setPeriod(index === 0 ? 'AM' : 'PM')}
              />
            </div>
          )}
        </div>

        {/* Quick select (Android) */}
        {!isIOS && (
          <div className="flex justify-center gap-2 mt-4 px-4">
            {[locale.now, '9:00', '12:00', '15:00', '18:00'].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  if (preset === locale.now) {
                    const now = new Date()
                    setHours(now.getHours())
                    setMinutes(now.getMinutes())
                    setPeriod(now.getHours() >= 12 ? 'PM' : 'AM')
                  } else {
                    const [h] = preset.split(':').map(Number)
                    setHours(h)
                    setMinutes(0)
                    setPeriod(h >= 12 ? 'PM' : 'AM')
                  }
                }}
                className="px-3 py-1.5 text-xs rounded-full"
                style={{
                  backgroundColor: colors.surfaceSecondary,
                  color: colors.textSecondary,
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

TimePicker.displayName = 'TimePicker'

// DateTime Picker combining both
export interface DateTimePickerProps {
  open: boolean
  onClose: () => void
  value?: Date
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  format?: '12' | '24'
  title?: string
  /** Text direction for RTL support */
  dir?: 'ltr' | 'rtl'
  /** Custom cancel button text */
  cancelText?: string
  /** Custom done button text */
  doneText?: string
}

export function DateTimePicker({
  open,
  onClose,
  value,
  onChange,
  minDate,
  maxDate,
  format = '24',
  title,
  dir,
  cancelText,
  doneText,
}: DateTimePickerProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const locale = useLocale()
  const isRTL = dir === 'rtl'

  const [mode, setMode] = useState<'date' | 'time'>('date')
  const [selectedDate, setSelectedDate] = useState<Date>(value || new Date())
  const [hours, setHours] = useState(selectedDate.getHours())
  const [minutes, setMinutes] = useState(selectedDate.getMinutes())

  useEffect(() => {
    if (open) {
      const d = value || new Date()
      setSelectedDate(d)
      setHours(d.getHours())
      setMinutes(d.getMinutes())
      setMode('date')
    }
  }, [open, value])

  const handleConfirm = () => {
    const result = new Date(selectedDate)
    result.setHours(hours)
    result.setMinutes(minutes)
    onChange(result)
    onClose()
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  // Calendar rendering (simplified inline version)
  const renderCalendar = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []

    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)

    const prevMonth = () => setSelectedDate(new Date(year, month - 1, 1))
    const nextMonth = () => setSelectedDate(new Date(year, month + 1, 1))

    return (
      <div className="p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2" style={{ color: colors.primary }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d={isRTL ? "M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" : "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"} />
            </svg>
          </button>
          <span className="font-semibold" style={{ color: colors.text }}>
            {locale.months[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2" style={{ color: colors.primary }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d={isRTL ? "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" : "M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"} />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {locale.weekdaysShort.map((day) => (
            <div key={day} className="text-center text-xs font-medium py-1" style={{ color: colors.textSecondary }}>
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={i} />
            const isSelected = day === selectedDate.getDate()
            const date = new Date(year, month, day)
            const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate)

            return (
              <button
                key={i}
                onClick={() => !isDisabled && setSelectedDate(new Date(year, month, day))}
                disabled={isDisabled}
                className="w-9 h-9 flex items-center justify-center rounded-full text-sm"
                style={{
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  color: isSelected ? '#FFFFFF' : isDisabled ? colors.border : colors.text,
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

  // Time wheels
  const hourItems = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minuteItems = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  return (
    <BottomSheet open={open} onClose={onClose} showHandle={!isIOS} height={480} cancelText={cancelText}>
      <div className="flex flex-col h-full" dir={dir}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          {isIOS ? (
            <>
              <button onClick={onClose} style={{ color: colors.primary }}>
                {cancelText || locale.cancel}
              </button>
              <span className="font-semibold" style={{ color: colors.text }}>
                {title || locale.selectDateTime}
              </span>
              <button
                onClick={handleConfirm}
                className="font-semibold"
                style={{ color: colors.primary }}
              >
                {doneText || locale.done}
              </button>
            </>
          ) : (
            <>
              <span className="text-lg font-medium" style={{ color: colors.text }}>
                {title || locale.selectDateTime}
              </span>
              <button
                onClick={handleConfirm}
                className="text-sm font-medium"
                style={{ color: colors.primary }}
              >
                {doneText || locale.ok}
              </button>
            </>
          )}
        </div>

        {/* Mode Tabs */}
        <div
          className="flex shrink-0"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <button
            onClick={() => setMode('date')}
            className="flex-1 py-3 text-sm font-medium"
            style={{
              color: mode === 'date' ? colors.primary : colors.textSecondary,
              borderBottomWidth: mode === 'date' ? 2 : 0,
              borderBottomColor: colors.primary,
              marginBottom: -1,
            }}
          >
            {locale.date}
          </button>
          <button
            onClick={() => setMode('time')}
            className="flex-1 py-3 text-sm font-medium"
            style={{
              color: mode === 'time' ? colors.primary : colors.textSecondary,
              borderBottomWidth: mode === 'time' ? 2 : 0,
              borderBottomColor: colors.primary,
              marginBottom: -1,
            }}
          >
            {locale.time}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {mode === 'date' ? (
            renderCalendar()
          ) : (
            <div className="flex items-center justify-center h-full px-4">
              <div className="w-20">
                <Wheel
                  items={hourItems}
                  selectedIndex={hours}
                  onChange={setHours}
                />
              </div>
              <div className="text-2xl font-bold mx-2" style={{ color: colors.text }}>:</div>
              <div className="w-20">
                <Wheel
                  items={minuteItems}
                  selectedIndex={minutes}
                  onChange={setMinutes}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}

DateTimePicker.displayName = 'DateTimePicker'
