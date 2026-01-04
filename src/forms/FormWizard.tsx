import React, { useState, createContext, useContext, Children, isValidElement, useMemo } from 'react'
import { cn } from '../ui/utils'
import { useTheme } from '../ui/theme'
import type { UseFormReturn } from './useForm'
import { Form } from './Form'

// Wizard context
interface WizardContextValue {
  currentStep: number
  totalSteps: number
  stepNames: string[]
  goToStep: (step: number) => void
  next: () => void
  prev: () => void
  isFirst: boolean
  isLast: boolean
  form: UseFormReturn<any>
}

const WizardContext = createContext<WizardContextValue | null>(null)

// Hook to access wizard context
export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a FormWizard')
  }
  return context
}

// Step component props
export interface FormWizardStepProps {
  /** Step name/key */
  name: string
  /** Step title (shown in progress indicator) */
  title?: string
  /** Validation fields for this step */
  validateFields?: string[]
  /** Step content */
  children: React.ReactNode
}

/**
 * FormWizard.Step - Individual wizard step
 */
function FormWizardStep({ children }: FormWizardStepProps) {
  return <>{children}</>
}

FormWizardStep.displayName = 'FormWizard.Step'

// Wizard props
export interface FormWizardProps {
  /** Form instance from useForm */
  form: UseFormReturn<any>
  /** Wizard steps */
  children: React.ReactNode
  /** Initial step index */
  initialStep?: number
  /** Show step indicator */
  showIndicator?: boolean
  /** Indicator position */
  indicatorPosition?: 'top' | 'bottom'
  /** Called when step changes */
  onStepChange?: (step: number, stepName: string) => void
  /** Called when wizard completes (last step submit) */
  onComplete?: (values: any) => void | Promise<void>
  /** Next button text */
  nextText?: string
  /** Previous button text */
  prevText?: string
  /** Complete button text */
  completeText?: string
  /** Additional class name */
  className?: string
}

/**
 * FormWizard - Multi-step form component
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   values: { phone: '', code: '', name: '' },
 *   validate: { ... }
 * })
 *
 * <FormWizard form={form} onComplete={handleComplete}>
 *   <FormWizard.Step name="phone" title="Phone">
 *     <FormField name="phone">
 *       <PhoneInput />
 *     </FormField>
 *   </FormWizard.Step>
 *
 *   <FormWizard.Step name="code" title="Verification">
 *     <FormField name="code">
 *       <OTPInput />
 *     </FormField>
 *   </FormWizard.Step>
 *
 *   <FormWizard.Step name="profile" title="Profile">
 *     <FormField name="name">
 *       <Input />
 *     </FormField>
 *   </FormWizard.Step>
 * </FormWizard>
 * ```
 */
export function FormWizard({
  form,
  children,
  initialStep = 0,
  showIndicator = true,
  indicatorPosition = 'top',
  onStepChange,
  onComplete,
  nextText = 'Continue',
  prevText = 'Back',
  completeText = 'Complete',
  className,
}: FormWizardProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const [currentStep, setCurrentStep] = useState(initialStep)

  // Extract steps from children
  const steps = useMemo(() => {
    const result: { name: string; title: string; validateFields?: string[]; content: React.ReactNode }[] = []
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === FormWizardStep) {
        const props = child.props as FormWizardStepProps
        result.push({
          name: props.name,
          title: props.title || props.name,
          validateFields: props.validateFields,
          content: props.children,
        })
      }
    })
    return result
  }, [children])

  const totalSteps = steps.length
  const stepNames = steps.map((s) => s.name)
  const isFirst = currentStep === 0
  const isLast = currentStep === totalSteps - 1
  const currentStepData = steps[currentStep]

  // Navigation
  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step)
      onStepChange?.(step, steps[step].name)
    }
  }

  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldsToValidate = currentStepData?.validateFields
    if (!fieldsToValidate || fieldsToValidate.length === 0) {
      return true
    }

    let isValid = true
    for (const field of fieldsToValidate) {
      const error = await form.validateField(field)
      form.setTouched(field, true)
      if (error) {
        isValid = false
      }
    }
    return isValid
  }

  const next = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && !isLast) {
      goToStep(currentStep + 1)
    }
  }

  const prev = () => {
    if (!isFirst) {
      goToStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = await validateCurrentStep()
    if (!isValid) return

    if (isLast) {
      // Complete wizard
      const allValid = await form.validateAll()
      if (allValid) {
        await onComplete?.(form.values)
      }
    } else {
      next()
    }
  }

  const contextValue: WizardContextValue = {
    currentStep,
    totalSteps,
    stepNames,
    goToStep,
    next,
    prev,
    isFirst,
    isLast,
    form,
  }

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          <React.Fragment key={step.name}>
            {/* Step dot/number */}
            <button
              type="button"
              onClick={() => index < currentStep && goToStep(index)}
              disabled={index > currentStep}
              className={cn(
                'flex items-center justify-center rounded-full transition-all',
                isIOS ? 'w-8 h-8 text-sm' : 'w-7 h-7 text-xs',
                isActive && 'ring-2 ring-offset-2',
                index > currentStep && 'opacity-40'
              )}
              style={{
                backgroundColor: isCompleted ? colors.success : isActive ? colors.primary : colors.surfaceSecondary,
                color: isCompleted || isActive ? '#FFFFFF' : colors.textSecondary,
                // @ts-expect-error ring-color is valid CSS custom property
                '--tw-ring-color': colors.primary,
              }}
            >
              {isCompleted ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : (
                index + 1
              )}
            </button>

            {/* Connector line */}
            {index < totalSteps - 1 && (
              <div
                className="w-8 h-0.5 rounded"
                style={{
                  backgroundColor: index < currentStep ? colors.success : colors.border,
                }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )

  // Step title
  const StepTitle = () => (
    <div className="text-center mb-4">
      <h2
        className={cn('font-semibold', isIOS ? 'text-xl' : 'text-lg')}
        style={{ color: colors.text }}
      >
        {currentStepData?.title}
      </h2>
      <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
        Step {currentStep + 1} of {totalSteps}
      </p>
    </div>
  )

  return (
    <WizardContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={cn('flex flex-col', className)}>
        {/* Top indicator */}
        {showIndicator && indicatorPosition === 'top' && <StepIndicator />}

        {/* Step title */}
        <StepTitle />

        {/* Step content */}
        <div className="flex-1">
          {currentStepData?.content}
        </div>

        {/* Bottom indicator */}
        {showIndicator && indicatorPosition === 'bottom' && <StepIndicator />}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {!isFirst && (
            <button
              type="button"
              onClick={prev}
              className="flex-1 py-3 rounded-lg font-medium"
              style={{
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
              }}
            >
              {prevText}
            </button>
          )}
          <button
            type="submit"
            disabled={form.submitting}
            className="flex-1 py-3 rounded-lg font-semibold disabled:opacity-50"
            style={{
              backgroundColor: colors.primary,
              color: '#FFFFFF',
            }}
          >
            {form.submitting ? 'Loading...' : isLast ? completeText : nextText}
          </button>
        </div>
      </form>
    </WizardContext.Provider>
  )
}

// Attach Step component
FormWizard.Step = FormWizardStep
FormWizard.displayName = 'FormWizard'
