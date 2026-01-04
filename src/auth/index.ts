// Store
export { getAuthStore, resetAuth, resetAllAuth, getActiveNamespaces, getAllSessions, subscribeToSessions } from './store'
export type { SessionInfo } from './store'

// Hooks
export { useAuth, useUser, useIsAuthenticated, useCurrentUserId, useRequireAuth } from './hooks'

// Components
export { RequireAuth, RequireRole, AuthGuard, RoleGuard, AccessDenied, type AccessDeniedProps } from './components'
export { OTPAuth } from './OTPAuth'

// Registry
export {
  defineUsers,
  defineRoles,
  getAppUsers,
  getAppRoles,
  getAllAppUsers,
  getAllAppRoles,
  getTestUser,
  getRole,
  getRegisteredAppIds,
  subscribeRegistry,
  clearUserRegistry,
} from './registry'

export type {
  TestUser,
  RoleDefinition,
  AppUsers,
  AppRoles,
  UserDefinitionInput,
  RoleDefinitionInput,
} from './registry'

// Quick Switch
export { quickSwitch, quickLogout } from './quickSwitch'

// Types
export type {
  AuthUser,
  AuthState,
  AuthActions,
  UseAuthOptions,
  UseAuthReturn,
  RequireAuthProps,
  RequireRoleProps,
} from './types'

export type { OTPAuthProps, OTPAuthStep } from './OTPAuth'
