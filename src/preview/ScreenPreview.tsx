import React from 'react'
import { ThemeProvider } from '../ui/theme'
import { DeviceFrame } from '../canvas/DeviceFrame'
import { MockAuthProvider } from './MockAuthProvider'
import { getScreenComponent } from './index'
import type { DeviceType } from '../canvas/types'

// Mock navigation context for preview
const MockNavigationContext = React.createContext<{
  navigate: (name: string, params?: Record<string, unknown>) => void
  goBack: () => void
  replace: (name: string, params?: Record<string, unknown>) => void
  reset: (name?: string) => void
  canGoBack: () => boolean
  state: { routes: Array<{ name: string; params: Record<string, unknown>; key: string }>; index: number }
  currentRoute: { name: string; params: Record<string, unknown>; key: string }
  options: Record<string, unknown>
}>({
  navigate: () => {},
  goBack: () => {},
  replace: () => {},
  reset: () => {},
  canGoBack: () => false,
  state: { routes: [], index: 0 },
  currentRoute: { name: '', params: {}, key: '' },
  options: {},
})

export interface ScreenPreviewProps {
  /** Screen name to render */
  screen: string
  /** Navigator ID (default: 'main') */
  navigatorId?: string
  /** App ID */
  appId?: string
  /** User ID for mock auth */
  userId?: string
  /** Platform: 'ios' or 'android' */
  platform?: 'ios' | 'android'
  /** Show device frame */
  showFrame?: boolean
  /** Device type for frame */
  device?: DeviceType
  /** Scale factor */
  scale?: number
  /** Additional props to pass to screen component */
  screenProps?: Record<string, unknown>
  /** Mock route params */
  params?: Record<string, unknown>
  /** Custom className */
  className?: string
  /** Background color */
  background?: string
}

/**
 * ScreenPreview - Render a screen component in isolation
 *
 * Used for preview mode, screenshots, and documentation.
 * Renders the screen without Navigator, with mock auth and navigation.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ScreenPreview screen="home" appId="myapp" />
 *
 * // With device frame
 * <ScreenPreview
 *   screen="profile"
 *   appId="myapp"
 *   userId="user-1"
 *   showFrame={true}
 *   device="iphone-14"
 * />
 *
 * // With params
 * <ScreenPreview
 *   screen="order-details"
 *   appId="myapp"
 *   params={{ orderId: '123' }}
 * />
 * ```
 */
export function ScreenPreview({
  screen,
  navigatorId = 'main',
  appId,
  userId,
  platform = 'ios',
  showFrame = false,
  device = 'iphone-14',
  scale = 1,
  screenProps = {},
  params = {},
  className,
  background = '#f3f4f6',
}: ScreenPreviewProps) {
  // Get screen component from registry
  const Component = getScreenComponent(screen, navigatorId, appId)

  if (!Component) {
    return (
      <div
        className="flex items-center justify-center h-full p-8 text-center"
        style={{ backgroundColor: background }}
      >
        <div>
          <div className="text-lg font-semibold text-red-600 mb-2">
            Screen not found: "{screen}"
          </div>
          <div className="text-sm text-gray-500">
            Make sure the Navigator has mounted and registered its screens.
            <br />
            navigatorId: {navigatorId}
            {appId && <>, appId: {appId}</>}
          </div>
        </div>
      </div>
    )
  }

  // Mock navigation context value
  const mockNavigation = {
    navigate: (name: string, p?: Record<string, unknown>) => {
      console.log('[Preview] navigate:', name, p)
    },
    goBack: () => {
      console.log('[Preview] goBack')
    },
    replace: (name: string, p?: Record<string, unknown>) => {
      console.log('[Preview] replace:', name, p)
    },
    reset: (name?: string) => {
      console.log('[Preview] reset:', name)
    },
    canGoBack: () => false,
    state: { routes: [{ name: screen, params, key: `${screen}-preview` }], index: 0 },
    currentRoute: { name: screen, params, key: `${screen}-preview` },
    options: {},
  }

  const content = (
    <ThemeProvider defaultPlatform={platform}>
      <MockAuthProvider appId={appId} userId={userId}>
        <MockNavigationContext.Provider value={mockNavigation}>
          <div className="h-full w-full overflow-auto">
            <Component
              params={params}
              navigation={mockNavigation}
              {...screenProps}
            />
          </div>
        </MockNavigationContext.Provider>
      </MockAuthProvider>
    </ThemeProvider>
  )

  // With device frame
  if (showFrame) {
    return (
      <div
        className={className}
        style={{
          backgroundColor: background,
          padding: 32,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <DeviceFrame device={device} scale={scale}>
          {content}
        </DeviceFrame>
      </div>
    )
  }

  // Without frame
  return (
    <div
      className={className}
      style={{
        backgroundColor: background,
        height: '100%',
        width: '100%',
      }}
    >
      {content}
    </div>
  )
}

ScreenPreview.displayName = 'ScreenPreview'

/**
 * Hook to use mock navigation in preview mode
 */
export function usePreviewNavigation() {
  return React.useContext(MockNavigationContext)
}
