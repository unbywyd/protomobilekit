import React from 'react'
import { useAuth } from './hooks'
import { useTheme } from '../ui/theme'
import type { RequireAuthProps, RequireRoleProps } from './types'

/**
 * RequireAuth - Render children only if user is authenticated
 *
 * @example
 * ```tsx
 * <RequireAuth fallback={<LoginScreen />}>
 *   <Dashboard />
 * </RequireAuth>
 * ```
 */
export function RequireAuth({
  children,
  fallback = null,
  namespace,
}: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth({ namespace })

  if (isLoading) {
    return null // or loading spinner
  }

  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

RequireAuth.displayName = 'RequireAuth'

/**
 * RequireRole - Render children only if user has required role
 *
 * @example
 * ```tsx
 * // Single role
 * <RequireRole role="admin" fallback={<AccessDenied />}>
 *   <AdminDashboard />
 * </RequireRole>
 *
 * // Multiple roles (any of them)
 * <RequireRole role={['admin', 'moderator']} fallback={<AccessDenied />}>
 *   <ModeratorPanel />
 * </RequireRole>
 * ```
 */
export function RequireRole({
  children,
  fallback = null,
  namespace,
  role,
}: RequireRoleProps) {
  const { user, isAuthenticated, isLoading } = useAuth({ namespace })

  if (isLoading) {
    return null
  }

  if (!isAuthenticated || !user) {
    return <>{fallback}</>
  }

  // Check role
  const userRole = user.role
  const requiredRoles = Array.isArray(role) ? role : [role]
  const hasRole = userRole && requiredRoles.includes(userRole)

  if (!hasRole) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

RequireRole.displayName = 'RequireRole'

/**
 * AuthGuard - Higher-order component version of RequireAuth
 *
 * @example
 * ```tsx
 * const ProtectedDashboard = AuthGuard(Dashboard, {
 *   fallback: <LoginScreen />
 * })
 * ```
 */
export function AuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: { fallback?: React.ReactNode; namespace?: string } = {}
) {
  const Wrapped = (props: P) => (
    <RequireAuth fallback={options.fallback} namespace={options.namespace}>
      <Component {...props} />
    </RequireAuth>
  )

  Wrapped.displayName = `AuthGuard(${Component.displayName || Component.name || 'Component'})`

  return Wrapped
}

/**
 * RoleGuard - Higher-order component version of RequireRole
 *
 * @example
 * ```tsx
 * const AdminOnly = RoleGuard(AdminPanel, {
 *   role: 'admin',
 *   fallback: <AccessDenied />
 * })
 * ```
 */
export function RoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: { role: string | string[]; fallback?: React.ReactNode; namespace?: string }
) {
  const Wrapped = (props: P) => (
    <RequireRole role={options.role} fallback={options.fallback} namespace={options.namespace}>
      <Component {...props} />
    </RequireRole>
  )

  Wrapped.displayName = `RoleGuard(${Component.displayName || Component.name || 'Component'})`

  return Wrapped
}

export interface AccessDeniedProps {
  /** Title text */
  title?: string
  /** Description text */
  message?: string
  /** Icon to show (default: lock icon) */
  icon?: React.ReactNode
  /** Action button */
  action?: React.ReactNode
}

/**
 * AccessDenied - Placeholder for unauthorized access
 *
 * Use as fallback in RequireRole when user doesn't have permission.
 *
 * @example
 * ```tsx
 * <RequireRole role="admin" fallback={<AccessDenied />}>
 *   <AdminPanel />
 * </RequireRole>
 *
 * // With custom message
 * <RequireRole
 *   role="premium"
 *   fallback={
 *     <AccessDenied
 *       title="Premium Feature"
 *       message="Upgrade to access this feature"
 *       action={<Button onPress={upgrade}>Upgrade</Button>}
 *     />
 *   }
 * >
 *   <PremiumContent />
 * </RequireRole>
 * ```
 */
export function AccessDenied({
  title = 'Access Denied',
  message = 'You don\'t have permission to view this content',
  icon,
  action,
}: AccessDeniedProps) {
  const { colors } = useTheme()

  return (
    <div
      className="flex flex-col items-center justify-center p-6 text-center min-h-[200px]"
      style={{ backgroundColor: colors.background }}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${colors.textSecondary}15` }}
      >
        {icon || (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.textSecondary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}
      </div>

      {/* Title */}
      <h3
        className="text-lg font-semibold mb-1"
        style={{ color: colors.text }}
      >
        {title}
      </h3>

      {/* Message */}
      <p
        className="text-sm mb-4 max-w-xs"
        style={{ color: colors.textSecondary }}
      >
        {message}
      </p>

      {/* Action */}
      {action}
    </div>
  )
}

AccessDenied.displayName = 'AccessDenied'
