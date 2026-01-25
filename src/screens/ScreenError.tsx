import React, { useState } from 'react'
import { useTheme } from '../ui/theme'
import { cn } from '../ui/utils'

export interface ScreenErrorProps {
  /** Причина ошибки */
  reason: string
  /** Debug информация */
  debug?: unknown
  /** Callback для повтора */
  onRetry?: () => void
  /** Callback для возврата */
  onGoBack?: () => void
}

/**
 * Компонент отображения ошибки резолвинга экрана
 * Показывается когда resolveParams возвращает { ok: false }
 */
export function ScreenError({ reason, debug, onRetry, onGoBack }: ScreenErrorProps) {
  const { colors } = useTheme()
  const [showDebug, setShowDebug] = useState(false)

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-14 border-b"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="flex items-center gap-1 text-sm"
            style={{ color: colors.primary }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
        )}
        <span
          className="font-medium"
          style={{ color: colors.text }}
        >
          Screen Error
        </span>
        <div className="w-12" /> {/* Spacer for alignment */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: colors.danger + '20' }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.danger}
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Title */}
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: colors.text }}
        >
          Cannot display screen
        </h2>

        {/* Reason */}
        <p
          className="text-sm mb-6 max-w-xs"
          style={{ color: colors.textSecondary }}
        >
          {reason}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium',
                'transition-colors'
              )}
              style={{
                backgroundColor: colors.primary,
                color: '#fff',
              }}
            >
              Retry
            </button>
          )}

          {debug !== undefined && (
            <button
              onClick={() => setShowDebug(!showDebug)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium',
                'border transition-colors'
              )}
              style={{
                borderColor: colors.border,
                color: colors.textSecondary,
              }}
            >
              {showDebug ? 'Hide' : 'Show'} debug
            </button>
          )}
        </div>

        {/* Debug info */}
        {showDebug && debug !== undefined && (
          <pre
            className={cn(
              'mt-6 p-4 rounded-lg text-left text-xs',
              'overflow-auto max-w-full max-h-48',
              'font-mono'
            )}
            style={{
              backgroundColor: colors.surface,
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
            }}
          >
            {JSON.stringify(debug, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
