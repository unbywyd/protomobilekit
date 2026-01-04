import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import calendar from 'dayjs/plugin/calendar'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import duration from 'dayjs/plugin/duration'

// Initialize plugins
dayjs.extend(relativeTime)
dayjs.extend(calendar)
dayjs.extend(localizedFormat)
dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(duration)

// Re-export dayjs for direct usage
export { dayjs }

// Type for date inputs
type DateInput = Date | string | number | dayjs.Dayjs

/**
 * Format date to "time ago" format
 * @example timeAgo(new Date()) // "a few seconds ago"
 * @example timeAgo('2024-01-01') // "3 months ago"
 */
export function timeAgo(date: DateInput): string {
  return dayjs(date).fromNow()
}

/**
 * Format date to "time from now" format
 * @example timeFromNow(futureDate) // "in 3 days"
 */
export function timeFromNow(date: DateInput): string {
  return dayjs(date).toNow()
}

/**
 * Smart date formatting based on how recent the date is
 * - Today: "Today at 3:30 PM"
 * - Yesterday: "Yesterday at 3:30 PM"
 * - This week: "Monday at 3:30 PM"
 * - This year: "Jan 15 at 3:30 PM"
 * - Older: "Jan 15, 2023 at 3:30 PM"
 */
export function smartDate(date: DateInput): string {
  return dayjs(date).calendar(null, {
    sameDay: '[Today at] h:mm A',
    lastDay: '[Yesterday at] h:mm A',
    lastWeek: 'dddd [at] h:mm A',
    sameElse: function (this: dayjs.Dayjs) {
      if (this.year() === dayjs().year()) {
        return 'MMM D [at] h:mm A'
      }
      return 'MMM D, YYYY [at] h:mm A'
    },
  })
}

/**
 * Short smart date without time
 * - Today: "Today"
 * - Yesterday: "Yesterday"
 * - This week: "Monday"
 * - This year: "Jan 15"
 * - Older: "Jan 15, 2023"
 */
export function smartDateShort(date: DateInput): string {
  const d = dayjs(date)
  if (d.isToday()) return 'Today'
  if (d.isYesterday()) return 'Yesterday'
  if (d.isAfter(dayjs().subtract(7, 'day'))) return d.format('dddd')
  if (d.year() === dayjs().year()) return d.format('MMM D')
  return d.format('MMM D, YYYY')
}

/**
 * Format date with common presets
 */
export function formatDate(
  date: DateInput,
  format: 'short' | 'medium' | 'long' | 'full' | 'time' | 'datetime' | string = 'medium'
): string {
  const d = dayjs(date)

  switch (format) {
    case 'short':
      return d.format('MM/DD/YY')
    case 'medium':
      return d.format('MMM D, YYYY')
    case 'long':
      return d.format('MMMM D, YYYY')
    case 'full':
      return d.format('dddd, MMMM D, YYYY')
    case 'time':
      return d.format('h:mm A')
    case 'datetime':
      return d.format('MMM D, YYYY h:mm A')
    default:
      return d.format(format)
  }
}

/**
 * Check if date is today
 */
export function isDateToday(date: DateInput): boolean {
  return dayjs(date).isToday()
}

/**
 * Check if date is yesterday
 */
export function isDateYesterday(date: DateInput): boolean {
  return dayjs(date).isYesterday()
}

/**
 * Check if date is in the past
 */
export function isPast(date: DateInput): boolean {
  return dayjs(date).isBefore(dayjs())
}

/**
 * Check if date is in the future
 */
export function isFuture(date: DateInput): boolean {
  return dayjs(date).isAfter(dayjs())
}

/**
 * Get difference between two dates in specified unit
 */
export function dateDiff(
  date1: DateInput,
  date2: DateInput,
  unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' = 'day'
): number {
  return dayjs(date1).diff(dayjs(date2), unit)
}

/**
 * Add time to a date
 */
export function addTime(
  date: DateInput,
  amount: number,
  unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'
): Date {
  return dayjs(date).add(amount, unit).toDate()
}

/**
 * Subtract time from a date
 */
export function subtractTime(
  date: DateInput,
  amount: number,
  unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'
): Date {
  return dayjs(date).subtract(amount, unit).toDate()
}

/**
 * Get start of a time period
 */
export function startOf(
  date: DateInput,
  unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'
): Date {
  return dayjs(date).startOf(unit).toDate()
}

/**
 * Get end of a time period
 */
export function endOf(
  date: DateInput,
  unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'
): Date {
  return dayjs(date).endOf(unit).toDate()
}

/**
 * Format duration (e.g., for video length, call duration)
 * @example formatDuration(3661) // "1:01:01"
 * @example formatDuration(125) // "2:05"
 */
export function formatDuration(seconds: number): string {
  const dur = dayjs.duration(seconds, 'seconds')
  const hours = Math.floor(dur.asHours())
  const mins = dur.minutes()
  const secs = dur.seconds()

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format duration in human readable format
 * @example formatDurationHuman(3661) // "1 hour 1 minute"
 * @example formatDurationHuman(125) // "2 minutes"
 */
export function formatDurationHuman(seconds: number, short = false): string {
  const dur = dayjs.duration(seconds, 'seconds')
  const hours = Math.floor(dur.asHours())
  const mins = dur.minutes()
  const secs = dur.seconds()

  const parts: string[] = []

  if (hours > 0) {
    parts.push(short ? `${hours}h` : `${hours} hour${hours !== 1 ? 's' : ''}`)
  }
  if (mins > 0) {
    parts.push(short ? `${mins}m` : `${mins} minute${mins !== 1 ? 's' : ''}`)
  }
  if (secs > 0 && hours === 0) {
    parts.push(short ? `${secs}s` : `${secs} second${secs !== 1 ? 's' : ''}`)
  }

  return parts.join(' ') || (short ? '0s' : '0 seconds')
}

/**
 * Parse date from various formats
 */
export function parseDate(input: string, format?: string): Date | null {
  const parsed = format ? dayjs(input, format) : dayjs(input)
  return parsed.isValid() ? parsed.toDate() : null
}

/**
 * Check if date string is valid
 */
export function isValidDate(input: string, format?: string): boolean {
  const parsed = format ? dayjs(input, format) : dayjs(input)
  return parsed.isValid()
}

/**
 * Get month names
 */
export function getMonthNames(short = false): string[] {
  const format = short ? 'MMM' : 'MMMM'
  return Array.from({ length: 12 }, (_, i) =>
    dayjs().month(i).format(format)
  )
}

/**
 * Get day names
 */
export function getDayNames(short = false): string[] {
  const format = short ? 'ddd' : 'dddd'
  return Array.from({ length: 7 }, (_, i) =>
    dayjs().day(i).format(format)
  )
}
