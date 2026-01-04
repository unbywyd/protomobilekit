import React, { createContext, useContext } from 'react'
import { cn } from '../ui/utils'
import { DeviceFrame } from './DeviceFrame'
import { useAuth, useCurrentUserId } from '../auth/hooks'
import type { AppDefinition, CanvasConfig, CanvasLayout } from './types'

// App context to identify current app
interface AppContextValue {
  appId: string
  appName: string
}

const AppContext = createContext<AppContextValue | null>(null)

/**
 * useAppContext - Get current app info or null if outside Canvas
 */
export function useAppContext(): AppContextValue | null {
  return useContext(AppContext)
}

/**
 * useApp - Unified hook for app context + auth
 *
 * Combines app context with authentication state for convenient access
 * to common app-level data in any screen component.
 *
 * @example
 * ```tsx
 * function HomeScreen() {
 *   const { user, userId, logout, appId } = useApp()
 *
 *   if (!user) {
 *     return <LoginScreen />
 *   }
 *
 *   return (
 *     <View>
 *       <Text>Welcome, {user.name}!</Text>
 *       <Button onPress={logout}>Logout</Button>
 *     </View>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Use userId for entity operations
 * function CreateOrder() {
 *   const { userId } = useApp()
 *   const orders = useRepo<Order>('Order')
 *
 *   const handleCreate = () => {
 *     orders.create({
 *       customerId: userId!,
 *       status: 'pending',
 *       items: [],
 *     })
 *   }
 * }
 * ```
 */
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within a Canvas app')
  }

  const auth = useAuth()
  const userId = useCurrentUserId()

  return {
    // App context
    appId: context.appId,
    appName: context.appName,

    // Auth
    user: auth.user,
    userId,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    login: auth.login,
    logout: auth.logout,
    updateUser: auth.updateUser,
  }
}

export type UseAppReturn = ReturnType<typeof useApp>

export interface CanvasProps extends CanvasConfig {
  className?: string
}

/**
 * Canvas - Multi-app layout container
 */
export function Canvas({
  apps,
  layout = 'row',
  background = '#f3f4f6',
  gap = 32,
  scale = 1,
  showLabels = true,
  className,
}: CanvasProps) {
  const layoutClasses: Record<CanvasLayout, string> = {
    row: 'flex flex-row flex-wrap justify-center items-start',
    grid: 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-center',
    freeform: 'relative',
  }

  return (
    <div
      className={cn(
        'min-h-screen w-full p-8 overflow-auto',
        layoutClasses[layout],
        className
      )}
      style={{ backgroundColor: background, gap }}
    >
      {apps.map((app) => (
        <AppContext.Provider
          key={app.id}
          value={{ appId: app.id, appName: app.name }}
        >
          <DeviceFrame
            device={app.device}
            config={app.deviceConfig}
            scale={scale}
            showLabel={showLabels}
            label={app.name}
          >
            {app.component()}
          </DeviceFrame>
        </AppContext.Provider>
      ))}
    </div>
  )
}

Canvas.displayName = 'Canvas'

/**
 * defineApp - Helper to define an app
 */
export function defineApp(app: AppDefinition): AppDefinition {
  return app
}
