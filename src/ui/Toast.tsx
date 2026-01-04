import React, { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils'
import { useTheme } from './theme'
import { useCanvasRoot } from '../canvas/DeviceFrame'

export type ToastType = 'default' | 'success' | 'error' | 'warning'

export interface ToastData {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextValue {
  show: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export interface ToastProviderProps {
  children: React.ReactNode
  position?: 'top' | 'bottom'
}

export function ToastProvider({ children, position = 'bottom' }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((message: string, type: ToastType = 'default', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type, duration }])

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  const success = useCallback((message: string, duration?: number) => {
    show(message, 'success', duration)
  }, [show])

  const error = useCallback((message: string, duration?: number) => {
    show(message, 'error', duration)
  }, [show])

  const warning = useCallback((message: string, duration?: number) => {
    show(message, 'warning', duration)
  }, [show])

  const info = useCallback((message: string, duration?: number) => {
    show(message, 'default', duration)
  }, [show])

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: ToastData[]
  position: 'top' | 'bottom'
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, position, onRemove }: ToastContainerProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const canvasRoot = useCanvasRoot()

  if (toasts.length === 0) return null

  // Use absolute positioning when inside Canvas, fixed otherwise
  const isInsideCanvas = !!canvasRoot

  const content = (
    <div
      className="flex flex-col gap-2 pointer-events-none"
      style={{
        position: isInsideCanvas ? 'absolute' : 'fixed',
        left: 16,
        right: 16,
        zIndex: 100,
        [position === 'top' ? 'top' : 'bottom']: 16,
        paddingTop: position === 'top' ? 16 : 0,
        paddingBottom: position === 'bottom' ? 34 : 0, // Safe area for home indicator
      }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          isIOS={isIOS}
          colors={colors}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )

  // Portal into canvas root when inside Canvas
  if (isInsideCanvas && canvasRoot) {
    return createPortal(content, canvasRoot)
  }

  return content
}

interface ToastItemProps {
  toast: ToastData
  isIOS: boolean
  colors: ReturnType<typeof useTheme>['colors']
  onRemove: () => void
}

function ToastItem({ toast, isIOS, colors, onRemove }: ToastItemProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const getBackgroundColor = () => {
    // Use theme colors with opacity for glass effect
    switch (toast.type) {
      case 'success': return colors.text + 'F2' // 95% opacity
      case 'error': return colors.text + 'F2'
      case 'warning': return colors.textSecondary + 'F2'
      default: return colors.text + 'F2'
    }
  }

  const getIcon = () => {
    const fill = colors.primaryText
    switch (toast.type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill={fill}>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill={fill}>
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        )
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill={fill}>
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 cursor-pointer pointer-events-auto',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
      style={{
        backgroundColor: getBackgroundColor(),
        backdropFilter: isIOS ? 'blur(20px)' : undefined,
      }}
      onClick={onRemove}
    >
      {getIcon()}
      <span className="flex-1 text-sm font-medium" style={{ color: colors.primaryText }}>
        {toast.message}
      </span>
    </div>
  )
}

ToastProvider.displayName = 'ToastProvider'
