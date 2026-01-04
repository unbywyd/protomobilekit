import React from 'react'
import { useTheme } from './theme'
import { Button, type ButtonProps } from './Button'
import { cn } from './utils'

export interface FooterAction {
  label: string
  onPress: () => void
  variant?: ButtonProps['variant']
  disabled?: boolean
  loading?: boolean
}

export interface ActionFooterProps {
  /** Single action or array of actions */
  actions: FooterAction | FooterAction[]
  /** Additional className */
  className?: string
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg'
  /** Show border on top */
  border?: boolean
  /** Direction for multiple buttons */
  direction?: 'row' | 'column'
  /** Gap between buttons */
  gap?: number
}

/**
 * ActionFooter - Footer with action buttons
 *
 * @example
 * ```tsx
 * // Single action
 * <Screen footer={<ActionFooter actions={{ label: 'Submit', onPress: handleSubmit }} />}>
 *
 * // Multiple actions
 * <Screen footer={
 *   <ActionFooter
 *     actions={[
 *       { label: 'Cancel', onPress: onClose, variant: 'outline' },
 *       { label: 'Save', onPress: handleSave },
 *     ]}
 *   />
 * }>
 *
 * // Conditional action
 * const nextAction = getNextAction()
 * <Screen footer={nextAction && <ActionFooter actions={nextAction} />}>
 * ```
 */
export function ActionFooter({
  actions,
  className,
  padding = 'md',
  border = true,
  direction = 'row',
  gap = 12,
}: ActionFooterProps) {
  const { colors } = useTheme()

  const actionArray = Array.isArray(actions) ? actions : [actions]

  const paddingClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      className={cn(
        paddingClasses[padding],
        border && 'border-t',
        className
      )}
      style={{
        backgroundColor: colors.surface,
        borderColor: border ? colors.border : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: direction,
          gap,
        }}
      >
        {actionArray.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            onClick={action.onPress}
            disabled={action.disabled}
            loading={action.loading}
            fullWidth
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

// Convenience component for common patterns
export interface SubmitFooterProps {
  onSubmit: () => void
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  disabled?: boolean
}

/**
 * SubmitFooter - Pre-configured footer for form submission
 *
 * @example
 * ```tsx
 * <Screen footer={
 *   <SubmitFooter
 *     onSubmit={handleSubmit}
 *     onCancel={onClose}
 *     loading={isSubmitting}
 *   />
 * }>
 * ```
 */
export function SubmitFooter({
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading,
  disabled,
}: SubmitFooterProps) {
  const actions: FooterAction[] = []

  if (onCancel) {
    actions.push({
      label: cancelLabel,
      onPress: onCancel,
      variant: 'outline',
      disabled: loading,
    })
  }

  actions.push({
    label: submitLabel,
    onPress: onSubmit,
    loading,
    disabled,
  })

  return <ActionFooter actions={actions} />
}
