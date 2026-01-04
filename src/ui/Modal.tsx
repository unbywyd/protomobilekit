import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils'
import { useTheme } from './theme'
import { useCanvasRoot } from '../canvas/DeviceFrame'

export interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** Modal title */
  title?: string
  /** Show close button */
  showClose?: boolean
  /** Close on backdrop click */
  closeOnBackdrop?: boolean
  /** Full screen modal */
  fullScreen?: boolean
  className?: string
}

export function Modal({
  open,
  onClose,
  children,
  title,
  showClose = true,
  closeOnBackdrop = true,
  fullScreen = false,
  className,
}: ModalProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const canvasRoot = useCanvasRoot()

  // Lock body scroll when open (only if not in canvas)
  useEffect(() => {
    if (!canvasRoot && open) {
      document.body.style.overflow = 'hidden'
    } else if (!canvasRoot) {
      document.body.style.overflow = ''
    }
    return () => {
      if (!canvasRoot) {
        document.body.style.overflow = ''
      }
    }
  }, [open, canvasRoot])

  if (!open) return null

  // Use absolute positioning when rendering in canvas, fixed when in document.body
  const isInCanvas = canvasRoot !== null
  const positioningClass = isInCanvas ? 'absolute' : 'fixed'

  const content = fullScreen ? (
    <div
      className={cn(positioningClass, 'inset-0 z-50 flex flex-col')}
      style={{ backgroundColor: colors.background }}
    >
      {/* iOS-style navigation bar for full screen */}
      {isIOS ? (
        <div
          className="flex items-center justify-between px-4 h-11 border-b shrink-0"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <button
            onClick={onClose}
            className="text-base"
            style={{ color: colors.primary }}
          >
            Cancel
          </button>
          {title && (
            <h2 className="text-base font-semibold" style={{ color: colors.text }}>
              {title}
            </h2>
          )}
          <div style={{ width: 60 }} />
        </div>
      ) : (
        <div
          className="flex items-center px-4 h-14 gap-4 shrink-0"
          style={{ backgroundColor: colors.surface }}
        >
          <button onClick={onClose} className="p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                fill={colors.text}
              />
            </svg>
          </button>
          {title && (
            <h2 className="text-lg font-medium" style={{ color: colors.text }}>
              {title}
            </h2>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  ) : (
    <div className={cn(positioningClass, 'inset-0 z-50 flex items-center justify-center p-4')}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{ backgroundColor: colors.overlay }}
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-sm flex flex-col max-h-[80%]',
          'transform transition-all duration-200',
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          className
        )}
        style={{
          backgroundColor: colors.surface,
          borderRadius: isIOS ? '14px' : '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        {(title || showClose) && (
          <div
            className={cn(
              'flex items-center shrink-0',
              isIOS ? 'justify-center py-4 px-4' : 'justify-between py-6 px-6'
            )}
          >
            {isIOS ? (
              <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
                {title}
              </h2>
            ) : (
              <>
                <h2 className="text-xl font-medium" style={{ color: colors.text }}>
                  {title}
                </h2>
                {showClose && (
                  <button onClick={onClose} className="p-1 -mr-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                        fill={colors.textSecondary}
                      />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn('flex-1 overflow-y-auto', isIOS ? 'px-4 pb-4' : 'px-6 pb-6')}>
          {children}
        </div>
      </div>
    </div>
  )

  // Render to canvas root via portal for multi-canvas support
  return createPortal(content, canvasRoot || document.body)
}

Modal.displayName = 'Modal'
