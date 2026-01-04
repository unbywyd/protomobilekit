import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  Children,
  isValidElement,
} from 'react'
import { useTheme } from '../ui/theme'
import { cn } from '../ui/utils'
import type { TabDefinition, TabNavigatorProps } from './types'

// Tab context
interface TabContextValue {
  activeTab: string
  setActiveTab: (name: string) => void
  tabs: TabDefinition[]
}

const TabContext = createContext<TabContextValue | null>(null)

/**
 * useTab - Access tab navigation
 */
export function useTab() {
  const context = useContext(TabContext)
  if (!context) {
    throw new Error('useTab must be used within a TabNavigator')
  }
  return context
}

// Tab.Screen component
interface TabScreenProps {
  name: string
  component: React.ComponentType<any>
  icon?: React.ReactNode
  activeIcon?: React.ReactNode
  label?: string
  badge?: number | string
}

function TabScreen(_props: TabScreenProps): null {
  return null
}

TabScreen.displayName = 'TabNavigator.Screen'

/**
 * TabNavigator - Bottom tab navigation
 *
 * @example
 * ```tsx
 * <TabNavigator initial="home">
 *   <TabNavigator.Screen
 *     name="home"
 *     component={HomeScreen}
 *     icon={<HomeIcon />}
 *     label="Home"
 *   />
 *   <TabNavigator.Screen
 *     name="search"
 *     component={SearchScreen}
 *     icon={<SearchIcon />}
 *     label="Search"
 *   />
 *   <TabNavigator.Screen
 *     name="profile"
 *     component={ProfileScreen}
 *     icon={<ProfileIcon />}
 *     label="Profile"
 *     badge={3}
 *   />
 * </TabNavigator>
 * ```
 */
export function TabNavigator({
  children,
  tabs: tabsProp,
  initial,
  position = 'bottom',
  tabBarHidden = false,
  tabBarStyle,
}: TabNavigatorProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  // Extract tabs from children or use tabs prop
  const tabs = useMemo(() => {
    if (tabsProp) return tabsProp

    const result: TabDefinition[] = []
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === TabScreen) {
        const props = child.props as TabScreenProps
        result.push({
          name: props.name,
          component: props.component,
          icon: props.icon,
          activeIcon: props.activeIcon,
          label: props.label,
          badge: props.badge,
        })
      }
    })
    return result
  }, [children, tabsProp])

  const initialTab = initial || tabs[0]?.name || ''
  const [activeTab, setActiveTab] = useState(initialTab)

  const contextValue: TabContextValue = useMemo(
    () => ({ activeTab, setActiveTab, tabs }),
    [activeTab, tabs]
  )

  const activeTabDef = tabs.find((t) => t.name === activeTab)
  const Component = activeTabDef?.component

  // Tab bar component
  const TabBar = () => (
    <div
      className={cn(
        'flex items-center justify-around',
        isIOS ? 'h-[83px] pb-[34px]' : 'h-14',
        'border-t'
      )}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        ...tabBarStyle,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.name === activeTab
        const icon = isActive && tab.activeIcon ? tab.activeIcon : tab.icon

        return (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
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
              {tab.badge !== undefined && (
                <div
                  className={cn(
                    'absolute -top-1 -right-1 min-w-[18px] h-[18px]',
                    'flex items-center justify-center',
                    'rounded-full text-xs font-medium text-white px-1'
                  )}
                  style={{ backgroundColor: colors.danger }}
                >
                  {typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
                </div>
              )}
            </div>

            {/* Label */}
            {tab.label && (
              <span
                className={cn('text-[10px] mt-1', isIOS ? 'font-medium' : 'font-normal')}
                style={{ color: isActive ? colors.primary : colors.textSecondary }}
              >
                {tab.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )

  return (
    <TabContext.Provider value={contextValue}>
      <div className="flex flex-col h-full w-full">
        {/* Top tab bar */}
        {position === 'top' && !tabBarHidden && <TabBar />}

        {/* Screen content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {Component ? <Component /> : null}
        </div>

        {/* Bottom tab bar */}
        {position === 'bottom' && !tabBarHidden && <TabBar />}
      </div>
    </TabContext.Provider>
  )
}

// Attach Screen component
TabNavigator.Screen = TabScreen
TabNavigator.displayName = 'TabNavigator'
