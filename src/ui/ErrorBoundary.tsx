import React, { Component, type ReactNode } from 'react'
import { useTheme } from './theme'

export interface ErrorBoundaryProps {
  /** Content to render */
  children: ReactNode
  /** Custom fallback UI */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary - Catch errors in child components
 *
 * Prevents the entire app from crashing when a component throws an error.
 * Shows a fallback UI and allows the user to retry.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // Custom fallback
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <View>
 *       <Text>Error: {error.message}</Text>
 *       <Button onPress={reset}>Try Again</Button>
 *     </View>
 *   )}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With error logging
 * <ErrorBoundary onError={(error) => logToService(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = 'ErrorBoundary'

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.reset)
        }
        return this.props.fallback
      }

      // Default fallback
      return <DefaultErrorFallback error={this.state.error} onReset={this.reset} />
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  const { colors } = useTheme()

  return (
    <div
      className="flex flex-col items-center justify-center p-6 text-center min-h-[200px]"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${colors.danger}20` }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.danger}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h3
        className="text-lg font-semibold mb-1"
        style={{ color: colors.text }}
      >
        Something went wrong
      </h3>

      <p
        className="text-sm mb-4 max-w-xs"
        style={{ color: colors.textSecondary }}
      >
        {error.message || 'An unexpected error occurred'}
      </p>

      <button
        onClick={onReset}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{
          backgroundColor: colors.primary,
          color: '#fff',
        }}
      >
        Try Again
      </button>
    </div>
  )
}
