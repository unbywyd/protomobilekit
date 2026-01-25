import React, { useEffect, useMemo } from 'react'
import { ThemeProvider } from '../ui/theme'
import { ToastProvider } from '../ui/Toast'
import { getScreen, type DirectScreen } from './screenRegistry'
import { getAppUsers } from '../auth/registry'
import { getAuthStore } from '../auth/store'
import { NavigationContext, type NavigationContextValue } from '../navigation'

export interface DirectScreenRendererProps {
  directScreen: DirectScreen
  appId: string
  platform?: 'ios' | 'android'
}

/**
 * Renders a screen directly, bypassing Navigator and app component.
 * Provides mock navigation context and auto-logs in test user.
 */
export function DirectScreenRenderer({
  directScreen,
  appId,
  platform = 'ios',
}: DirectScreenRendererProps) {
  const screenEntry = getScreen(appId, directScreen.screen)
  const params = directScreen.params || {}

  // Auto-login user for this app's auth store
  useEffect(() => {
    const users = getAppUsers(appId)
    if (!users || users.length === 0) return

    // Find user to login
    const targetUser = directScreen.userId
      ? users.find(u => u.id === directScreen.userId)
      : users[0]

    if (targetUser) {
      const store = getAuthStore(appId)
      // Login this user
      store.getState().login({
        id: targetUser.id,
        name: targetUser.name,
        phone: targetUser.phone,
        avatar: targetUser.avatar,
        role: targetUser.role,
      })
    }
  }, [appId, directScreen.userId])

  // Mock navigation context value - must be called before any conditional return
  const mockNavigation: NavigationContextValue = useMemo(() => ({
    navigate: (name, p) => console.log('[DirectScreen] navigate:', name, p),
    goBack: () => console.log('[DirectScreen] goBack'),
    replace: (name, p) => console.log('[DirectScreen] replace:', name, p),
    reset: (name) => console.log('[DirectScreen] reset:', name),
    canGoBack: () => false,
    state: {
      routes: [{ name: directScreen.screen, params, key: `${directScreen.screen}-direct` }],
      index: 0,
    },
    currentRoute: { name: directScreen.screen, params, key: `${directScreen.screen}-direct` },
    options: {},
  }), [directScreen.screen, params])

  // Screen not found - return after all hooks
  if (!screenEntry) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <div>
          <div className="text-lg font-semibold text-red-600 mb-2">
            Screen not found: "{directScreen.screen}"
          </div>
          <div className="text-sm text-gray-500">
            App: {appId}
          </div>
        </div>
      </div>
    )
  }

  const Component = screenEntry.component

  return (
    <ThemeProvider defaultPlatform={platform}>
      <ToastProvider>
        <NavigationContext.Provider value={mockNavigation}>
          <div className="h-full w-full overflow-auto">
            <Component
              params={params}
              navigation={mockNavigation}
            />
          </div>
        </NavigationContext.Provider>
      </ToastProvider>
    </ThemeProvider>
  )
}
