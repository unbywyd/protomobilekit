import React from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils'
import { useTheme } from './theme'
import { useLocale } from './locale'
import { useCanvasRoot } from '../canvas/DeviceFrame'

export interface AlertButton {
  text: string
  onPress: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

export interface AlertProps {
  open: boolean
  onClose: () => void
  title: string
  message?: string
  buttons?: AlertButton[]
}

export function Alert({
  open,
  onClose,
  title,
  message,
  buttons,
}: AlertProps) {
  // If no buttons provided, create a simple close button without text
  const alertButtons = buttons || [{ text: '', onPress: onClose, style: 'default' as const }]
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const canvasRoot = useCanvasRoot()

  if (!open) return null

  const getButtonColor = (style?: AlertButton['style']) => {
    if (style === 'destructive') return colors.danger
    if (style === 'cancel') return colors.textSecondary
    return colors.primary
  }

  const getButtonWeight = (style?: AlertButton['style']) => {
    if (style === 'cancel') return '400'
    return '600'
  }

  // Use absolute positioning when rendering in canvas, fixed when in document.body
  const isInCanvas = canvasRoot !== null
  const positioningClass = isInCanvas ? 'absolute' : 'fixed'

  const content = (
    <div className={cn(positioningClass, 'inset-0 z-50 flex items-center justify-center p-4')}>
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: colors.overlay }}
      />

      {/* Alert */}
      {isIOS ? (
        // iOS Alert
        <div
          className="relative w-[270px] overflow-hidden"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '14px',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="px-4 pt-5 pb-4 text-center">
            <h2
              className="text-base font-semibold mb-1"
              style={{ color: colors.text }}
            >
              {title}
            </h2>
            {message && (
              <p className="text-sm" style={{ color: colors.text }}>
                {message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div
            className={cn(
              'flex border-t',
              alertButtons.length > 2 ? 'flex-col' : 'flex-row'
            )}
            style={{ borderColor: 'rgba(60, 60, 67, 0.29)' }}
          >
            {alertButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.onPress}
                className={cn(
                  'flex-1 py-3 text-base',
                  alertButtons.length <= 2 && index > 0 && 'border-l',
                  alertButtons.length > 2 && index > 0 && 'border-t'
                )}
                style={{
                  borderColor: 'rgba(60, 60, 67, 0.29)',
                  color: getButtonColor(button.style),
                  fontWeight: getButtonWeight(button.style),
                }}
              >
                {button.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Android Dialog
        <div
          className="relative w-[280px] overflow-hidden"
          style={{
            backgroundColor: colors.surface,
            borderRadius: '28px',
          }}
        >
          <div className="px-6 pt-6 pb-4">
            <h2
              className="text-xl font-medium mb-4"
              style={{ color: colors.text }}
            >
              {title}
            </h2>
            {message && (
              <p className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                {message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 px-6 pb-6">
            {alertButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.onPress}
                className="px-3 py-2.5 text-sm font-medium rounded-full"
                style={{
                  color: getButtonColor(button.style),
                }}
              >
                {button.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(content, canvasRoot || document.body)
}

Alert.displayName = 'Alert'

// Confirm dialog helper
export interface ConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  destructive = false,
}: ConfirmProps) {
  const { platform } = useTheme()
  const isIOS = platform === 'ios'
  const locale = useLocale()

  const buttons: AlertButton[] = isIOS
    ? [
        { text: cancelText || locale.cancel, onPress: onClose, style: 'cancel' },
        { text: confirmText || locale.confirm, onPress: () => { onConfirm(); onClose(); }, style: destructive ? 'destructive' : 'default' },
      ]
    : [
        { text: cancelText || locale.cancel, onPress: onClose, style: 'cancel' },
        { text: confirmText || locale.confirm, onPress: () => { onConfirm(); onClose(); }, style: destructive ? 'destructive' : 'default' },
      ]

  return (
    <Alert
      open={open}
      onClose={onClose}
      title={title}
      message={message}
      buttons={buttons}
    />
  )
}

Confirm.displayName = 'Confirm'

// Prompt dialog (with input)
export interface PromptProps {
  open: boolean
  onClose: () => void
  onSubmit: (value: string) => void
  title: string
  message?: string
  placeholder?: string
  defaultValue?: string
  submitText?: string
  cancelText?: string
}

export function Prompt({
  open,
  onClose,
  onSubmit,
  title,
  message,
  placeholder,
  defaultValue = '',
  submitText,
  cancelText,
}: PromptProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const locale = useLocale()
  const canvasRoot = useCanvasRoot()
  const [value, setValue] = React.useState(defaultValue)

  React.useEffect(() => {
    if (open) setValue(defaultValue)
  }, [open, defaultValue])

  if (!open) return null

  const handleSubmit = () => {
    onSubmit(value)
    onClose()
  }

  // Use absolute positioning when rendering in canvas, fixed when in document.body
  const isInCanvas = canvasRoot !== null
  const positioningClass = isInCanvas ? 'absolute' : 'fixed'

  const content = (
    <div className={cn(positioningClass, 'inset-0 z-50 flex items-center justify-center p-4')}>
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: colors.overlay }}
      />

      {/* Dialog */}
      {isIOS ? (
        <div
          className="relative w-[270px] overflow-hidden"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '14px',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="px-4 pt-5 pb-4 text-center">
            <h2 className="text-base font-semibold mb-1" style={{ color: colors.text }}>
              {title}
            </h2>
            {message && (
              <p className="text-sm mb-4" style={{ color: colors.text }}>
                {message}
              </p>
            )}
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-2 py-1.5 text-sm border rounded"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
              autoFocus
            />
          </div>

          <div className="flex border-t" style={{ borderColor: 'rgba(60, 60, 67, 0.29)' }}>
            <button
              onClick={onClose}
              className="flex-1 py-3 text-base"
              style={{ color: colors.primary }}
            >
              {cancelText || locale.cancel}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 text-base font-semibold border-l"
              style={{ color: colors.primary, borderColor: 'rgba(60, 60, 67, 0.29)' }}
            >
              {submitText || locale.ok}
            </button>
          </div>
        </div>
      ) : (
        <div
          className="relative w-[280px] overflow-hidden"
          style={{
            backgroundColor: colors.surface,
            borderRadius: '28px',
          }}
        >
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-xl font-medium mb-4" style={{ color: colors.text }}>
              {title}
            </h2>
            {message && (
              <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                {message}
              </p>
            )}
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 text-base border-b-2 bg-transparent focus:outline-none"
              style={{
                borderColor: colors.primary,
                color: colors.text,
              }}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 px-6 py-6">
            <button
              onClick={onClose}
              className="px-3 py-2.5 text-sm font-medium"
              style={{ color: colors.primary }}
            >
              {cancelText || locale.cancel}
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-2.5 text-sm font-medium"
              style={{ color: colors.primary }}
            >
              {submitText || locale.ok}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(content, canvasRoot || document.body)
}

Prompt.displayName = 'Prompt'
