import type { ReactNode } from 'react'

// Route params
export type RouteParams = Record<string, any>

// Screen component props
export interface ScreenProps<P extends RouteParams = RouteParams> {
  params: P
  navigation: NavigationActions
}

// Navigation actions available to screens
export interface NavigationActions {
  navigate: <P extends RouteParams = RouteParams>(name: string, params?: P) => void
  goBack: () => void
  replace: <P extends RouteParams = RouteParams>(name: string, params?: P) => void
  reset: (name?: string) => void
  canGoBack: () => boolean
}

// Route in the stack
export interface Route {
  name: string
  params: RouteParams
  key: string
}

// Navigation state
export interface NavigationState {
  routes: Route[]
  index: number
}

// Screen definition
export interface ScreenDefinition {
  name: string
  component: React.ComponentType<any>
  options?: ScreenOptions
  // Tab-specific props
  icon?: ReactNode
  activeIcon?: ReactNode
  label?: string
  badge?: number | string
}

// Screen options
export interface ScreenOptions {
  /** Screen title (for header) */
  title?: string
  /** Hide header */
  headerShown?: boolean
  /** Custom header component */
  header?: ReactNode
  /** Transition animation */
  animation?: 'slide' | 'fade' | 'none'
  /** Transition duration override (ms) */
  transitionDurationMs?: number
  /** Gesture enabled (swipe back) */
  gestureEnabled?: boolean
}

// Navigator type
export type NavigatorType = 'stack' | 'tabs'

// Navigator props
export interface NavigatorProps {
  /** Initial screen name */
  initial: string
  /** Screen components */
  children: ReactNode
  /** Navigation type: stack (push/pop) or tabs (switch) */
  type?: NavigatorType
  /** Default screen options */
  screenOptions?: ScreenOptions
  /** Tab bar position (only for type="tabs") */
  tabBarPosition?: 'bottom' | 'top'
  /** Hide tab bar (only for type="tabs") */
  tabBarHidden?: boolean
  /** Custom tab bar style */
  tabBarStyle?: React.CSSProperties
}

// Tab definition
export interface TabDefinition {
  name: string
  icon?: ReactNode
  activeIcon?: ReactNode
  label?: string
  badge?: number | string
  component: React.ComponentType<any>
}

// Tab navigator props
export interface TabNavigatorProps {
  /** Tab definitions via children or tabs prop */
  children?: ReactNode
  tabs?: TabDefinition[]
  /** Initial tab name */
  initial?: string
  /** Tab bar position */
  position?: 'bottom' | 'top'
  /** Hide tab bar */
  tabBarHidden?: boolean
  /** Custom tab bar style */
  tabBarStyle?: React.CSSProperties
}
