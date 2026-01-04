import { useState, useCallback, useMemo } from 'react'

// Validator function type
export type Validator<T = any> = (
  value: T,
  values: Record<string, any>
) => string | null | Promise<string | null>

// Form field state
export interface FieldState {
  value: any
  error: string | null
  touched: boolean
  dirty: boolean
}

// Form state
export interface FormState<T extends Record<string, any>> {
  values: T
  errors: Partial<Record<keyof T, string | null>>
  touched: Partial<Record<keyof T, boolean>>
  dirty: boolean
  valid: boolean
  submitting: boolean
  submitted: boolean
}

// useForm options
export interface UseFormOptions<T extends Record<string, any>> {
  /** Initial form values */
  values: T
  /** Field validators */
  validate?: Partial<Record<keyof T, Validator>>
  /** Validate on change (default: false) */
  validateOnChange?: boolean
  /** Validate on blur (default: true) */
  validateOnBlur?: boolean
  /** Form submit handler */
  onSubmit?: (values: T) => void | Promise<void>
  /** Called when values change */
  onChange?: (values: T) => void
}

// Field props returned by getFieldProps
export interface FieldProps {
  value: any
  onChange: (value: any) => void
  onBlur: () => void
  error: string | null
  touched: boolean
  disabled: boolean
}

// useForm return type
export interface UseFormReturn<T extends Record<string, any>> {
  // State
  values: T
  errors: Partial<Record<keyof T, string | null>>
  touched: Partial<Record<keyof T, boolean>>
  dirty: boolean
  valid: boolean
  submitting: boolean
  submitted: boolean

  // Field operations
  getValue: (name: keyof T) => any
  setValue: (name: keyof T, value: any) => void
  setValues: (values: Partial<T>) => void
  getError: (name: keyof T) => string | null
  setError: (name: keyof T, error: string | null) => void
  setErrors: (errors: Partial<Record<keyof T, string | null>>) => void
  isTouched: (name: keyof T) => boolean
  setTouched: (name: keyof T, touched?: boolean) => void

  // Field props helper
  getFieldProps: (name: keyof T) => FieldProps
  field: (name: keyof T) => FieldProps // Alias

  // Validation
  validateField: (name: keyof T) => Promise<string | null>
  validateAll: () => Promise<boolean>

  // Form operations
  submit: () => Promise<void>
  reset: (values?: T) => void
  clear: () => void
}

/**
 * useForm - Simple form state management hook
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   values: { name: '', email: '' },
 *   validate: {
 *     name: (v) => !v ? 'Required' : null,
 *     email: (v) => !v.includes('@') ? 'Invalid email' : null,
 *   },
 *   onSubmit: async (values) => {
 *     await api.createUser(values)
 *   }
 * })
 * ```
 */
export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    values: initialValues,
    validate: validateConfig = {} as Partial<Record<keyof T, Validator>>,
    validateOnChange = false,
    validateOnBlur = true,
    onSubmit,
    onChange,
  } = options

  // Form state
  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string | null>>>({})
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Computed state
  const dirty = useMemo(() => {
    return Object.keys(values).some(
      (key) => values[key as keyof T] !== initialValues[key as keyof T]
    )
  }, [values, initialValues])

  const valid = useMemo(() => {
    return Object.values(errors).every((error) => !error)
  }, [errors])

  // Get single field value
  const getValue = useCallback(
    (name: keyof T) => values[name],
    [values]
  )

  // Set single field value
  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setValuesState((prev) => {
        const next = { ...prev, [name]: value }
        onChange?.(next)
        return next
      })

      if (validateOnChange && validateConfig[name]) {
        validateField(name)
      }
    },
    [onChange, validateOnChange, validateConfig]
  )

  // Set multiple values
  const setValues = useCallback(
    (newValues: Partial<T>) => {
      setValuesState((prev) => {
        const next = { ...prev, ...newValues }
        onChange?.(next)
        return next
      })
    },
    [onChange]
  )

  // Get field error
  const getError = useCallback(
    (name: keyof T) => errors[name] || null,
    [errors]
  )

  // Set field error
  const setError = useCallback((name: keyof T, error: string | null) => {
    setErrorsState((prev) => ({ ...prev, [name]: error }))
  }, [])

  // Set multiple errors
  const setErrors = useCallback(
    (newErrors: Partial<Record<keyof T, string | null>>) => {
      setErrorsState((prev) => ({ ...prev, ...newErrors }))
    },
    []
  )

  // Check if field is touched
  const isTouched = useCallback(
    (name: keyof T) => touched[name] || false,
    [touched]
  )

  // Set field touched
  const setTouched = useCallback((name: keyof T, value = true) => {
    setTouchedState((prev) => ({ ...prev, [name]: value }))
  }, [])

  // Validate single field
  const validateField = useCallback(
    async (name: keyof T): Promise<string | null> => {
      const validator = validateConfig[name]
      if (!validator) {
        setError(name, null)
        return null
      }

      try {
        const error = await validator(values[name], values)
        setError(name, error)
        return error
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Validation error'
        setError(name, errorMessage)
        return errorMessage
      }
    },
    [values, validateConfig, setError]
  )

  // Validate all fields
  const validateAll = useCallback(async (): Promise<boolean> => {
    const fieldNames = Object.keys(values) as Array<keyof T>
    const validationResults = await Promise.all(
      fieldNames.map(async (name) => {
        const error = await validateField(name)
        return { name, error }
      })
    )

    const newErrors: Partial<Record<keyof T, string | null>> = {}
    for (const { name, error } of validationResults) {
      newErrors[name] = error
    }
    setErrorsState(newErrors)

    return validationResults.every(({ error }) => !error)
  }, [values, validateField])

  // Get field props for binding to input
  const getFieldProps = useCallback(
    (name: keyof T): FieldProps => ({
      value: values[name],
      onChange: (value: any) => setValue(name, value),
      onBlur: () => {
        setTouched(name, true)
        if (validateOnBlur && validateConfig[name]) {
          validateField(name)
        }
      },
      error: errors[name] || null,
      touched: touched[name] || false,
      disabled: submitting,
    }),
    [values, errors, touched, submitting, setValue, setTouched, validateOnBlur, validateConfig, validateField]
  )

  // Submit form
  const submit = useCallback(async () => {
    // Mark all fields as touched
    const allTouched: Partial<Record<keyof T, boolean>> = {}
    for (const key of Object.keys(values)) {
      allTouched[key as keyof T] = true
    }
    setTouchedState(allTouched)

    // Validate all fields
    const isValid = await validateAll()
    if (!isValid) {
      return
    }

    // Submit
    setSubmitting(true)
    try {
      await onSubmit?.(values)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }, [values, validateAll, onSubmit])

  // Reset form to initial values
  const reset = useCallback(
    (newInitialValues?: T) => {
      const resetValues = newInitialValues || initialValues
      setValuesState(resetValues)
      setErrorsState({})
      setTouchedState({})
      setSubmitting(false)
      setSubmitted(false)
    },
    [initialValues]
  )

  // Clear form (empty values)
  const clear = useCallback(() => {
    const emptyValues: Partial<T> = {}
    for (const key of Object.keys(values)) {
      emptyValues[key as keyof T] = '' as any
    }
    setValuesState(emptyValues as T)
    setErrorsState({})
    setTouchedState({})
  }, [values])

  return {
    // State
    values,
    errors,
    touched,
    dirty,
    valid,
    submitting,
    submitted,

    // Field operations
    getValue,
    setValue,
    setValues,
    getError,
    setError,
    setErrors,
    isTouched,
    setTouched,

    // Field props helper
    getFieldProps,
    field: getFieldProps, // Alias

    // Validation
    validateField,
    validateAll,

    // Form operations
    submit,
    reset,
    clear,
  }
}
