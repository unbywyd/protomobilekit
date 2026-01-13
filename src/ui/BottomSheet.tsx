import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils'
import { useTheme } from './theme'
import { useLocale } from './locale'
import { useCanvasRoot } from '../canvas/DeviceFrame'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** Title for the sheet */
  title?: string
  /** Show drag handle */
  showHandle?: boolean
  /** Height: 'auto', 'half', 'full', or pixels */
  height?: 'auto' | 'half' | 'full' | number
  /** Close on backdrop click */
  closeOnBackdrop?: boolean
  /** Cancel button text (iOS only, shown when title is set) */
  cancelText?: string
  className?: string
}

export function BottomSheet({
  open,
  onClose,
  children,
  title,
  showHandle = true,
  height = 'auto',
  closeOnBackdrop = true,
  cancelText,
  className,
}: BottomSheetProps) {
  const { platform, colors } = useTheme()
  const locale = useLocale()
  const sheetRef = useRef<HTMLDivElement>(null)
  const canvasRoot = useCanvasRoot()

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const getHeightStyle = () => {
    if (typeof height === 'number') return `${height}px`
    switch (height) {
      case 'full': return '95%'
      case 'half': return '50%'
      default: return 'auto'
    }
  }

  const isIOS = platform === 'ios'

  if (!open) return null

  // Use absolute positioning when rendering in canvas, fixed when in document.body
  const isInCanvas = canvasRoot !== null
  const positioningClass = isInCanvas ? 'absolute' : 'fixed'

  const content = (
    <div 
      className={cn(positioningClass, 'inset-0 z-50')}
      style={isInCanvas ? { 
        left: 0, 
        right: 0, 
        top: 0, 
        bottom: 0,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        overflowX: 'hidden'
      } : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
        style={{ backgroundColor: colors.overlay }}
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0 flex flex-col',
          'transform transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
          className
        )}
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: isIOS ? '14px' : '16px',
          borderTopRightRadius: isIOS ? '14px' : '16px',
          maxHeight: '95%',
          height: getHeightStyle(),
        }}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center pt-2 pb-1">
            <div
              className={cn(
                isIOS ? 'w-9 h-1 rounded-full' : 'w-8 h-1 rounded-full'
              )}
              style={{
                backgroundColor: isIOS ? '#D1D1D6' : '#DADCE0',
              }}
            />
          </div>
        )}

        {/* Header */}
        {title && (
          <div
            className={cn(
              'flex items-center px-4 shrink-0',
              isIOS ? 'justify-center py-2' : 'justify-start py-4'
            )}
            style={{
              borderBottomWidth: isIOS ? 0 : 1,
              borderBottomColor: colors.border,
            }}
          >
            {isIOS ? (
              <>
                <button
                  onClick={onClose}
                  className="absolute left-4 text-base"
                  style={{ color: colors.primary }}
                >
                  {cancelText || locale.cancel}
                </button>
                <h2
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  {title}
                </h2>
              </>
            ) : (
              <h2
                className="text-lg font-medium"
                style={{ color: colors.text }}
              >
                {title}
              </h2>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )

  // Render to canvas root via portal for multi-canvas support
  // Fallback to document.body if not in a canvas context
  return createPortal(content, canvasRoot || document.body)
}

BottomSheet.displayName = 'BottomSheet'

// Action Sheet specific for iOS-style actions
export interface ActionSheetOption {
  label: string
  onPress: () => void
  destructive?: boolean
}

export interface ActionSheetProps {
  open: boolean
  onClose: () => void
  options: ActionSheetOption[]
  title?: string
  message?: string
  cancelLabel?: string
}

export function ActionSheet({
  open,
  onClose,
  options,
  title,
  message,
  cancelLabel,
}: ActionSheetProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const locale = useLocale()
  const canvasRoot = useCanvasRoot()

  if (!open) return null

  // Use absolute positioning when rendering in canvas, fixed when in document.body
  const isInCanvas = canvasRoot !== null
  const positioningClass = isInCanvas ? 'absolute' : 'fixed'

  const content = (
    <div 
      className={cn(positioningClass, 'inset-0 z-50')}
      style={isInCanvas ? { 
        left: 0, 
        right: 0, 
        top: 0, 
        bottom: 0,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        overflowX: 'hidden'
      } : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: colors.overlay }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-2',
          'transform transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {isIOS ? (
          // iOS Action Sheet
          <>
            <div
              className="rounded-xl overflow-hidden mb-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
            >
              {(title || message) && (
                <div className="px-4 py-3 text-center border-b" style={{ borderColor: colors.border }}>
                  {title && (
                    <div className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
                      {title}
                    </div>
                  )}
                  {message && (
                    <div className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                      {message}
                    </div>
                  )}
                </div>
              )}
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => { option.onPress(); onClose(); }}
                  className="w-full py-4 text-center text-lg border-b last:border-0"
                  style={{
                    borderColor: colors.border,
                    color: option.destructive ? colors.danger : colors.primary,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full py-4 text-center text-lg font-semibold rounded-xl"
              style={{
                backgroundColor: colors.surface,
                color: colors.primary,
              }}
            >
              {cancelLabel || locale.cancel}
            </button>
          </>
        ) : (
          // Android Action Sheet (Material style)
          <div
            className="rounded-t-xl overflow-hidden"
            style={{ backgroundColor: colors.surface }}
          >
            {(title || message) && (
              <div className="px-4 py-4">
                {title && (
                  <div className="text-base font-medium" style={{ color: colors.text }}>
                    {title}
                  </div>
                )}
                {message && (
                  <div className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                    {message}
                  </div>
                )}
              </div>
            )}
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => { option.onPress(); onClose(); }}
                className="w-full px-4 py-4 text-left text-base"
                style={{
                  color: option.destructive ? colors.danger : colors.text,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // Render to canvas root via portal for multi-canvas support
  // Fallback to document.body if not in a canvas context
  return createPortal(content, canvasRoot || document.body)
}

ActionSheet.displayName = 'ActionSheet'
