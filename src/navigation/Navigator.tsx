import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  Children,
  isValidElement,
} from 'react'
import { useTheme } from '../ui/theme'
import { cn } from '../ui/utils'
import { eventBus } from '../events/bus'
import { useAppContext } from '../canvas/Canvas'
import { registerNavigator, unregisterNavigator } from '../frames/registry'
import {
  registerScreen,
  unregisterNavigatorScreens,
  parseHash,
  buildHash,
} from './registry'
import type {
  NavigatorProps,
  ScreenDefinition,
  ScreenOptions,
  Route,
  NavigationState,
  NavigationActions,
  RouteParams,
} from './types'

// Navigation context
interface NavigationContextValue extends NavigationActions {
  state: NavigationState
  currentRoute: Route
  options: ScreenOptions
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

/**
 * useNavigate - Access navigation in any component
 */
export function useNavigate() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigate must be used within a Navigator')
  }
  return context
}

/**
 * useRoute - Get current route info
 */
export function useRoute<P extends RouteParams = RouteParams>() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useRoute must be used within a Navigator')
  }
  return {
    name: context.currentRoute.name,
    params: context.currentRoute.params as P,
    key: context.currentRoute.key,
  }
}

// Screen component props (used to define screens)
interface NavigatorScreenProps {
  name: string
  component: React.ComponentType<any>
  options?: ScreenOptions
  // Tab-specific props
  icon?: React.ReactNode
  activeIcon?: React.ReactNode
  label?: string
  badge?: number | string
}

function NavigatorScreen(_props: NavigatorScreenProps): null {
  return null
}

NavigatorScreen.displayName = 'Navigator.Screen'

/**
 * Navigator - Unified navigation component
 *
 * Supports both stack navigation (push/pop) and tab navigation (switch).
 *
 * @example
 * ```tsx
 * // Stack navigation (default)
 * <Navigator initial="home">
 *   <Navigator.Screen name="home" component={HomeScreen} />
 *   <Navigator.Screen name="details" component={DetailsScreen} />
 * </Navigator>
 *
 * // Tab navigation
 * <Navigator initial="home" type="tabs">
 *   <Navigator.Screen name="home" component={HomeScreen} icon={<HomeIcon />} label="Home" />
 *   <Navigator.Screen name="orders" component={OrdersScreen} icon={<OrdersIcon />} label="Orders" />
 * </Navigator>
 * ```
 */
export function Navigator({
  initial,
  children,
  type = 'stack',
  screenOptions = {},
  tabBarPosition = 'bottom',
  tabBarHidden = false,
  tabBarStyle,
  useHash = false,
  id = 'main',
}: NavigatorProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const isTabs = type === 'tabs'
  const isUpdatingFromHash = useRef(false)

  // Extract screens from children
  const screens = useMemo(() => {
    const result: ScreenDefinition[] = []
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === NavigatorScreen) {
        const props = child.props as NavigatorScreenProps
        result.push({
          name: props.name,
          component: props.component,
          options: { ...screenOptions, ...props.options },
          icon: props.icon,
          activeIcon: props.activeIcon,
          label: props.label,
          badge: props.badge,
        })
      }
    })
    return result
  }, [children, screenOptions])

  // Register screens in global registry
  useEffect(() => {
    screens.forEach(screen => {
      registerScreen(
        screen.name,
        id,
        type,
        screen.options,
        screen.icon || screen.label ? {
          label: screen.label,
          icon: screen.icon,
          activeIcon: screen.activeIcon,
        } : undefined
      )
    })
    return () => unregisterNavigatorScreens(id)
  }, [screens, id, type])

  // Get initial route from hash if enabled
  const getInitialRoute = useCallback((): Route => {
    if (useHash && typeof window !== 'undefined') {
      const parsed = parseHash(window.location.hash)
      if (parsed && screens.some(s => s.name === parsed.screen)) {
        return { name: parsed.screen, params: parsed.params, key: `${parsed.screen}-${Date.now()}` }
      }
    }
    return { name: initial, params: {}, key: `${initial}-${Date.now()}` }
  }, [useHash, initial, screens])

  // Navigation state
  const [state, setState] = useState<NavigationState>(() => ({
    routes: [getInitialRoute()],
    index: 0,
  }))

  // Get list of tab screen names (screens with icon/label)
  const tabScreenNames = useMemo(() => {
    return screens.filter((s) => s.icon || s.label).map((s) => s.name)
  }, [screens])

  // Navigation actions
  const navigate = useCallback(<P extends RouteParams>(name: string, params?: P) => {
    const isTabScreen = tabScreenNames.includes(name)

    if (isTabs && isTabScreen) {
      // Tabs mode switching to a tab: reset stack to that tab
      eventBus.dispatch('navigation:switch', { screen: name, params }, 'navigator')
      setState({
        routes: [{ name, params: params || {}, key: `${name}-${Date.now()}` }],
        index: 0,
      })
    } else {
      // Stack mode OR tabs mode navigating to non-tab screen: push new screen
      eventBus.dispatch('navigation:push', { screen: name, params }, 'navigator')
      setState((prev) => ({
        routes: [...prev.routes, { name, params: params || {}, key: `${name}-${Date.now()}` }],
        index: prev.routes.length,
      }))
    }
  }, [isTabs, tabScreenNames])

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.index === 0) return prev
      setTimeout(() => {
        eventBus.dispatch('navigation:back', { from: prev.routes[prev.index].name }, 'navigator')
      }, 0)
      return {
        routes: prev.routes.slice(0, -1),
        index: prev.index - 1,
      }
    })
  }, [])

  const replace = useCallback(<P extends RouteParams>(name: string, params?: P) => {
    setState((prev) => {
      const newRoutes = [...prev.routes]
      newRoutes[prev.index] = { name, params: params || {}, key: `${name}-${Date.now()}` }
      return { routes: newRoutes, index: prev.index }
    })
  }, [])

  const reset = useCallback((name?: string) => {
    const screenName = name || initial
    setState({
      routes: [{ name: screenName, params: {}, key: `${screenName}-${Date.now()}` }],
      index: 0,
    })
  }, [initial])

  const canGoBack = useCallback(() => state.index > 0, [state.index])

  // Sync hash with navigation state
  useEffect(() => {
    if (!useHash || typeof window === 'undefined') return

    const currentRoute = state.routes[state.index]
    if (!isUpdatingFromHash.current) {
      const newHash = buildHash(currentRoute.name, currentRoute.params)
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash)
      }
    }
    isUpdatingFromHash.current = false
  }, [state, useHash])

  // Listen to hashchange events
  useEffect(() => {
    if (!useHash || typeof window === 'undefined') return

    const handleHashChange = () => {
      const parsed = parseHash(window.location.hash)
      if (parsed && screens.some(s => s.name === parsed.screen)) {
        const currentRoute = state.routes[state.index]
        // Only update if different from current
        if (parsed.screen !== currentRoute.name ||
            JSON.stringify(parsed.params) !== JSON.stringify(currentRoute.params)) {
          isUpdatingFromHash.current = true
          navigate(parsed.screen, parsed.params)
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [useHash, screens, state, navigate])

  // Register navigator with frame registry for this app
  const appContext = useAppContext()

  useEffect(() => {
    if (appContext?.appId) {
      registerNavigator(appContext.appId, { navigate, goBack, replace, reset })
      return () => unregisterNavigator(appContext.appId)
    }
  }, [appContext?.appId, navigate, goBack, replace, reset])

  // Current route and screen
  const currentRoute = state.routes[state.index]
  const currentScreen = screens.find((s) => s.name === currentRoute.name)
  const options = currentScreen?.options || {}
  const Component = currentScreen?.component

  // Context value
  const contextValue: NavigationContextValue = useMemo(
    () => ({
      state,
      currentRoute,
      options,
      navigate,
      goBack,
      replace,
      reset,
      canGoBack,
    }),
    [state, currentRoute, options, navigate, goBack, replace, reset, canGoBack]
  )

  if (!Component) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ color: colors.danger }}
      >
        Screen "{currentRoute.name}" not found
      </div>
    )
  }

  // Tab bar component - only show screens with icons
  const tabScreens = screens.filter((s) => s.icon || s.label)

  const TabBar = () => (
    <div
      className={cn(
        'flex items-center justify-around',
        isIOS ? 'h-[83px] pb-[34px] pt-2' : 'h-16 pt-1',
        'border-t'
      )}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        ...tabBarStyle,
      }}
    >
      {tabScreens.map((screen) => {
        const isActive = screen.name === currentRoute.name
        const icon = isActive && screen.activeIcon ? screen.activeIcon : screen.icon

        return (
          <button
            key={screen.name}
            onClick={() => navigate(screen.name)}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full',
              'transition-colors relative'
            )}
          >
            {/* Icon */}
            <div
              className="relative"
              style={{ color: isActive ? colors.primary : colors.textSecondary }}
            >
              {icon || (
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: isActive ? colors.primary : colors.textSecondary }}
                />
              )}

              {/* Badge */}
              {screen.badge !== undefined && (
                <div
                  className={cn(
                    'absolute -top-1 -right-1 min-w-[18px] h-[18px]',
                    'flex items-center justify-center',
                    'rounded-full text-xs font-medium text-white px-1'
                  )}
                  style={{ backgroundColor: colors.danger }}
                >
                  {typeof screen.badge === 'number' && screen.badge > 99 ? '99+' : screen.badge}
                </div>
              )}
            </div>

            {/* Label */}
            {screen.label && (
              <span
                className={cn('text-[10px] mt-1', isIOS ? 'font-medium' : 'font-normal')}
                style={{ color: isActive ? colors.primary : colors.textSecondary }}
              >
                {screen.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )

  // Check if current screen is a tab screen (has icon or label)
  const isCurrentScreenTab = tabScreenNames.includes(currentRoute.name)

  // Render
  if (isTabs) {
    return (
      <NavigationContext.Provider value={contextValue}>
        <div className="flex flex-col h-full w-full">
          {/* Top tab bar - only show for tab screens */}
          {tabBarPosition === 'top' && !tabBarHidden && isCurrentScreenTab && <TabBar />}

          {/* Screen content */}
          <div
            className="flex-1 min-h-0 overflow-hidden"
            style={{ backgroundColor: colors.background }}
          >
            <Component
              params={currentRoute.params}
              navigation={contextValue}
            />
          </div>

          {/* Bottom tab bar - only show for tab screens */}
          {tabBarPosition === 'bottom' && !tabBarHidden && isCurrentScreenTab && <TabBar />}
        </div>
      </NavigationContext.Provider>
    )
  }

  // Stack mode
  return (
    <NavigationContext.Provider value={contextValue}>
      <div
        className={cn('h-full w-full overflow-hidden', isIOS ? 'bg-white' : '')}
        style={{ backgroundColor: colors.background }}
      >
        <div className="h-full w-full">
          <Component
            params={currentRoute.params}
            navigation={contextValue}
          />
        </div>
      </div>
    </NavigationContext.Provider>
  )
}

// Attach Screen component
Navigator.Screen = NavigatorScreen
Navigator.displayName = 'Navigator'
