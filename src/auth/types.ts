/**
 * Auth Types
 */

export interface AuthUser {
  id: string
  name?: string
  email?: string
  phone?: string
  avatar?: string
  role?: string
  [key: string]: unknown
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthActions {
  login: (user: AuthUser) => void
  logout: () => void
  updateUser: (data: Partial<AuthUser>) => void
}

export interface UseAuthOptions {
  /** Namespace for auth storage (each app can have its own) */
  namespace?: string
}

export interface UseAuthReturn extends AuthState, AuthActions {}

export interface RequireAuthProps {
  children: React.ReactNode
  /** Fallback component when not authenticated */
  fallback?: React.ReactNode
  /** Namespace for auth check */
  namespace?: string
}

export interface RequireRoleProps extends RequireAuthProps {
  /** Required role(s) - can be string or array */
  role: string | string[]
}
