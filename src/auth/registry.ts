import type { AuthUser } from './types'

/**
 * TestUser - Extended AuthUser for test/development purposes
 */
export interface TestUser extends AuthUser {
  /** Test OTP code for simulated verification */
  testOTP?: string
  /** Default phone for prefill in OTP input */
  defaultPhone?: string
}

/**
 * RoleDefinition - Defines a role for an app
 */
export interface RoleDefinition {
  /** Role value used in code */
  value: string
  /** Display label */
  label: string
  /** Optional description */
  description?: string
  /** Color for visual distinction */
  color?: string
}

/**
 * AppUsers - Users registered for an app
 */
export interface AppUsers {
  appId: string
  users: TestUser[]
}

/**
 * AppRoles - Roles registered for an app
 */
export interface AppRoles {
  appId: string
  roles: RoleDefinition[]
}

/**
 * Input for defineUsers
 */
export interface UserDefinitionInput {
  appId: string
  users: TestUser[]
}

/**
 * Input for defineRoles
 */
export interface RoleDefinitionInput {
  appId: string
  roles: RoleDefinition[]
}

// Internal registries
const usersRegistry = new Map<string, AppUsers>()
const rolesRegistry = new Map<string, AppRoles>()
const listeners = new Set<() => void>()

/**
 * Notify all listeners of registry changes
 */
function notifyListeners() {
  listeners.forEach((listener) => listener())
}

/**
 * defineUsers - Register test users for an app
 *
 * @example
 * ```tsx
 * defineUsers({
 *   appId: 'customer',
 *   users: [
 *     { id: 'alice', name: 'Alice Smith', phone: '+441234567890', role: 'premium' },
 *     { id: 'bob', name: 'Bob Jones', phone: '+441234567891', role: 'regular' },
 *   ]
 * })
 * ```
 */
export function defineUsers(input: UserDefinitionInput): UserDefinitionInput {
  usersRegistry.set(input.appId, {
    appId: input.appId,
    users: input.users,
  })
  notifyListeners()
  return input
}

/**
 * defineRoles - Register roles for an app
 *
 * @example
 * ```tsx
 * defineRoles({
 *   appId: 'customer',
 *   roles: [
 *     { value: 'regular', label: 'Regular Customer' },
 *     { value: 'premium', label: 'Premium Customer', color: 'gold' },
 *   ]
 * })
 * ```
 */
export function defineRoles(input: RoleDefinitionInput): RoleDefinitionInput {
  rolesRegistry.set(input.appId, {
    appId: input.appId,
    roles: input.roles,
  })
  notifyListeners()
  return input
}

/**
 * Get all users for an app
 */
export function getAppUsers(appId: string): TestUser[] {
  return usersRegistry.get(appId)?.users ?? []
}

/**
 * Get all roles for an app
 */
export function getAppRoles(appId: string): RoleDefinition[] {
  return rolesRegistry.get(appId)?.roles ?? []
}

/**
 * Get all registered apps with users
 */
export function getAllAppUsers(): Map<string, AppUsers> {
  return new Map(usersRegistry)
}

/**
 * Get all registered apps with roles
 */
export function getAllAppRoles(): Map<string, AppRoles> {
  return new Map(rolesRegistry)
}

/**
 * Find a specific test user
 */
export function getTestUser(appId: string, userId: string): TestUser | undefined {
  const appUsers = usersRegistry.get(appId)
  return appUsers?.users.find((u) => u.id === userId)
}

/**
 * Find a specific role definition
 */
export function getRole(appId: string, roleValue: string): RoleDefinition | undefined {
  const appRoles = rolesRegistry.get(appId)
  return appRoles?.roles.find((r) => r.value === roleValue)
}

/**
 * Subscribe to registry changes
 */
export function subscribeRegistry(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Clear all registries (for testing)
 */
export function clearUserRegistry(): void {
  usersRegistry.clear()
  rolesRegistry.clear()
  notifyListeners()
}

/**
 * Get all app IDs with registered users
 */
export function getRegisteredAppIds(): string[] {
  return Array.from(usersRegistry.keys())
}
