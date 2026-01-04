// Built-in locales for UI components

export type LocaleCode = 'en' | 'ru' | 'he'

export interface UILocale {
  // Common
  ok: string
  cancel: string
  done: string
  confirm: string
  search: string
  select: string
  noResults: string
  selected: string

  // Calendar/DatePicker
  months: string[]
  monthsShort: string[]
  weekdays: string[]
  weekdaysShort: string[]
  selectDate: string
  selectTime: string
  selectDateTime: string
  date: string
  time: string

  // Form
  required: string
  enterPin: string

  // TimePicker
  now: string

  // RTL support
  rtl: boolean
}

const en: UILocale = {
  ok: 'OK',
  cancel: 'Cancel',
  done: 'Done',
  confirm: 'Confirm',
  search: 'Search',
  select: 'Select...',
  noResults: 'No results',
  selected: 'Selected',

  months: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  monthsShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ],
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  selectDate: 'Select Date',
  selectTime: 'Select Time',
  selectDateTime: 'Select Date & Time',
  date: 'Date',
  time: 'Time',

  required: 'Required',
  enterPin: 'Enter PIN',
  now: 'Now',
  rtl: false,
}

const ru: UILocale = {
  ok: 'OK',
  cancel: 'Отмена',
  done: 'Готово',
  confirm: 'Подтвердить',
  search: 'Поиск',
  select: 'Выбрать...',
  noResults: 'Ничего не найдено',
  selected: 'Выбрано',

  months: [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ],
  monthsShort: [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
  ],
  weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  weekdaysShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  selectDate: 'Выберите дату',
  selectTime: 'Выберите время',
  selectDateTime: 'Выберите дату и время',
  date: 'Дата',
  time: 'Время',

  required: 'Обязательно',
  enterPin: 'Введите PIN',
  now: 'Сейчас',
  rtl: false,
}

const he: UILocale = {
  ok: 'אישור',
  cancel: 'ביטול',
  done: 'סיום',
  confirm: 'אישור',
  search: 'חיפוש',
  select: 'בחר...',
  noResults: 'לא נמצאו תוצאות',
  selected: 'נבחר',

  months: [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
  ],
  monthsShort: [
    'ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ',
    'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ',
  ],
  weekdays: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  weekdaysShort: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
  selectDate: 'בחר תאריך',
  selectTime: 'בחר שעה',
  selectDateTime: 'בחר תאריך ושעה',
  date: 'תאריך',
  time: 'שעה',

  required: 'שדה חובה',
  enterPin: 'הזן PIN',
  now: 'עכשיו',
  rtl: true,
}

export const LOCALES: Record<LocaleCode, UILocale> = {
  en,
  ru,
  he,
}

export function getLocale(code: LocaleCode): UILocale {
  return LOCALES[code] || LOCALES.en
}

// Global locale state
let currentLocale: UILocale = en

/**
 * Set the global locale for all UI components.
 * Call this once before rendering your app.
 *
 * @example
 * // Using built-in locale
 * setLocale('he')
 *
 * // Using custom locale
 * setLocale({ ...getLocale('en'), ok: 'Accept' })
 */
export function setLocale(locale: LocaleCode | UILocale): void {
  if (typeof locale === 'string') {
    currentLocale = LOCALES[locale] || LOCALES.en
  } else {
    currentLocale = locale
  }
}

/**
 * Get the current global locale.
 * Used internally by all UI components.
 */
export function useLocale(): UILocale {
  return currentLocale
}

/**
 * Check if current locale is RTL.
 */
export function isRTL(): boolean {
  return currentLocale.rtl
}
