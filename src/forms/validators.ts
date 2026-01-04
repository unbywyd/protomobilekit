import type { Validator } from './useForm'

/**
 * Built-in validators for common use cases
 */

/** Required field validator */
export function required(message = 'This field is required'): Validator {
  return (value) => {
    if (value === undefined || value === null || value === '') {
      return message
    }
    if (Array.isArray(value) && value.length === 0) {
      return message
    }
    return null
  }
}

/** Minimum length validator */
export function minLength(min: number, message?: string): Validator<string> {
  return (value) => {
    if (!value) return null
    if (value.length < min) {
      return message || `Minimum ${min} characters`
    }
    return null
  }
}

/** Maximum length validator */
export function maxLength(max: number, message?: string): Validator<string> {
  return (value) => {
    if (!value) return null
    if (value.length > max) {
      return message || `Maximum ${max} characters`
    }
    return null
  }
}

/** Length range validator */
export function length(min: number, max: number, message?: string): Validator<string> {
  return (value) => {
    if (!value) return null
    if (value.length < min || value.length > max) {
      return message || `Length must be between ${min} and ${max}`
    }
    return null
  }
}

/** Email validator */
export function email(message = 'Invalid email address'): Validator<string> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return (value) => {
    if (!value) return null
    if (!emailRegex.test(value)) {
      return message
    }
    return null
  }
}

/** Phone number validators by country */
export const phonePatterns: Record<string, RegExp> = {
  ru: /^\+7\d{10}$/,
  us: /^\+1\d{10}$/,
  ua: /^\+380\d{9}$/,
  kz: /^\+7\d{10}$/,
  by: /^\+375\d{9}$/,
  default: /^\+\d{10,15}$/,
}

export function phone(country: keyof typeof phonePatterns = 'default', message?: string): Validator<string> {
  const pattern = phonePatterns[country] || phonePatterns.default
  return (value) => {
    if (!value) return null
    // Remove spaces and dashes for validation
    const cleaned = value.replace(/[\s\-()]/g, '')
    if (!pattern.test(cleaned)) {
      return message || `Invalid phone number format`
    }
    return null
  }
}

/** Number range validator */
export function range(min: number, max: number, message?: string): Validator<number> {
  return (value) => {
    if (value === undefined || value === null) return null
    if (value < min || value > max) {
      return message || `Value must be between ${min} and ${max}`
    }
    return null
  }
}

/** Minimum value validator */
export function min(minValue: number, message?: string): Validator<number> {
  return (value) => {
    if (value === undefined || value === null) return null
    if (value < minValue) {
      return message || `Minimum value is ${minValue}`
    }
    return null
  }
}

/** Maximum value validator */
export function max(maxValue: number, message?: string): Validator<number> {
  return (value) => {
    if (value === undefined || value === null) return null
    if (value > maxValue) {
      return message || `Maximum value is ${maxValue}`
    }
    return null
  }
}

/** Pattern/regex validator */
export function pattern(regex: RegExp, message = 'Invalid format'): Validator<string> {
  return (value) => {
    if (!value) return null
    if (!regex.test(value)) {
      return message
    }
    return null
  }
}

/** URL validator */
export function url(message = 'Invalid URL'): Validator<string> {
  return (value) => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return message
    }
  }
}

/** Match another field validator */
export function match(fieldName: string, message?: string): Validator {
  return (value, values) => {
    if (!value) return null
    if (value !== values[fieldName]) {
      return message || `Does not match ${fieldName}`
    }
    return null
  }
}

/** Custom validator from function */
export function custom<T = any>(
  fn: (value: T, values: Record<string, any>) => boolean,
  message = 'Invalid value'
): Validator<T> {
  return (value, values) => {
    if (!fn(value, values)) {
      return message
    }
    return null
  }
}

/** Compose multiple validators */
export function compose<T = any>(...validators: Validator<T>[]): Validator<T> {
  return async (value, values) => {
    for (const validator of validators) {
      const error = await validator(value, values)
      if (error) return error
    }
    return null
  }
}

/** Make validator optional (skip if empty) */
export function optional<T = any>(validator: Validator<T>): Validator<T> {
  return (value, values) => {
    if (value === undefined || value === null || value === '') {
      return null
    }
    return validator(value, values)
  }
}

/** Async validator wrapper (for API calls) */
export function async<T = any>(
  fn: (value: T, values: Record<string, any>) => Promise<boolean>,
  message = 'Validation failed'
): Validator<T> {
  return async (value, values) => {
    try {
      const isValid = await fn(value, values)
      return isValid ? null : message
    } catch {
      return message
    }
  }
}

// Export validators object for convenient access
export const validators = {
  required,
  minLength,
  maxLength,
  length,
  email,
  phone,
  range,
  min,
  max,
  pattern,
  url,
  match,
  custom,
  compose,
  optional,
  async,
}
