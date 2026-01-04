import React, { createContext, useContext, Children, cloneElement, isValidElement } from 'react'
import { cn } from '../ui/utils'
import { useTheme } from '../ui/theme'
import type { UseFormReturn, FieldProps } from './useForm'

// Form context
interface FormContextValue {
  form: UseFormReturn<any>
}

const FormContext = createContext<FormContextValue | null>(null)

// Hook to access form from context
export function useFormContext() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within a Form component')
  }
  return context.form
}

// Form props
export interface FormProps {
  /** Form instance from useForm */
  form: UseFormReturn<any>
  /** Form children */
  children: React.ReactNode
  /** Additional class name */
  className?: string
  /** Disable all fields */
  disabled?: boolean
  /** Custom onSubmit (overrides form.submit) */
  onSubmit?: (e: React.FormEvent) => void
}

/**
 * Form - Wrapper component that provides form context
 *
 * @example
 * ```tsx
 * <Form form={form}>
 *   <FormField name="email" label="Email">
 *     <Input type="email" />
 *   </FormField>
 *   <Button type="submit">Submit</Button>
 * </Form>
 * ```
 */
export function Form({
  form,
  children,
  className,
  disabled = false,
  onSubmit,
}: FormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(e)
    } else {
      form.submit()
    }
  }

  return (
    <FormContext.Provider value={{ form }}>
      <form
        onSubmit={handleSubmit}
        className={cn('flex flex-col gap-4', className)}
        noValidate
      >
        <fieldset disabled={disabled || form.submitting} className="contents">
          {children}
        </fieldset>
      </form>
    </FormContext.Provider>
  )
}

Form.displayName = 'Form'

// FormField props
export interface FormFieldProps {
  /** Field name (must match form values key) */
  name: string
  /** Field label */
  label?: string
  /** Helper text */
  helper?: string
  /** Mark as optional (shows "(optional)" label) */
  optional?: boolean
  /** Hide error message (still shows error state) */
  hideError?: boolean
  /** Additional class name */
  className?: string
  /** Child input component */
  children: React.ReactNode
}

/**
 * FormField - Wrapper for form inputs that auto-binds to form state
 *
 * @example
 * ```tsx
 * <FormField name="email" label="Email" helper="We'll never share your email">
 *   <Input type="email" placeholder="your@email.com" />
 * </FormField>
 * ```
 */
export function FormField({
  name,
  label,
  helper,
  optional = false,
  hideError = false,
  className,
  children,
}: FormFieldProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const form = useFormContext()
  const fieldProps = form.getFieldProps(name)
  const showError = fieldProps.touched && fieldProps.error && !hideError

  // Clone child and inject field props
  const child = Children.only(children)
  if (!isValidElement(child)) {
    throw new Error('FormField children must be a valid React element')
  }

  const enhancedChild = cloneElement(child as React.ReactElement<any>, {
    value: fieldProps.value,
    onChange: (valueOrEvent: any) => {
      // Handle both direct value and event
      const value = valueOrEvent?.target?.value ?? valueOrEvent
      fieldProps.onChange(value)

      // Call original onChange if exists
      const originalOnChange = (child as React.ReactElement<any>).props.onChange
      if (originalOnChange) {
        originalOnChange(valueOrEvent)
      }
    },
    onBlur: (e: any) => {
      fieldProps.onBlur()

      // Call original onBlur if exists
      const originalOnBlur = (child as React.ReactElement<any>).props.onBlur
      if (originalOnBlur) {
        originalOnBlur(e)
      }
    },
    disabled: fieldProps.disabled || (child as React.ReactElement<any>).props.disabled,
    // Pass error for visual styling (red border) - always pass if error exists
    // Input/TextArea will only show error text if they have label prop
    error: fieldProps.error || undefined,
    // Remove label and helper - FormField handles those
    label: undefined,
    helper: undefined,
  })

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Label */}
      {label && (
        <label
          className={cn(
            'font-medium flex items-center gap-1',
            isIOS ? 'text-sm' : 'text-xs uppercase tracking-wide'
          )}
          style={{ color: colors.textSecondary }}
        >
          {label}
          {optional && (
            <span className="font-normal opacity-70">(optional)</span>
          )}
        </label>
      )}

      {/* Input */}
      {enhancedChild}

      {/* Error message */}
      {showError && (
        <p className="text-sm" style={{ color: colors.danger }}>
          {fieldProps.error}
        </p>
      )}

      {/* Helper text */}
      {helper && !showError && (
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          {helper}
        </p>
      )}
    </div>
  )
}

FormField.displayName = 'FormField'

// FormRow - horizontal layout for multiple fields
export interface FormRowProps {
  children: React.ReactNode
  className?: string
}

export function FormRow({ children, className }: FormRowProps) {
  return (
    <div className={cn('flex gap-3', className)}>
      {Children.map(children, (child) => (
        <div className="flex-1">{child}</div>
      ))}
    </div>
  )
}

FormRow.displayName = 'FormRow'

// FormSection - group of fields with title
export interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  const { colors } = useTheme()

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-base font-semibold" style={{ color: colors.text }}>
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

FormSection.displayName = 'FormSection'

// FormActions - footer with submit/cancel buttons
export interface FormActionsProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right' | 'stretch'
}

export function FormActions({ children, className, align = 'stretch' }: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    stretch: '',
  }

  return (
    <div
      className={cn(
        'flex gap-3 mt-2',
        alignClasses[align],
        align === 'stretch' && 'flex-col',
        className
      )}
    >
      {children}
    </div>
  )
}

FormActions.displayName = 'FormActions'
