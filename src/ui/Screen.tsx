import React, { useRef, useState, useCallback } from 'react'
import { cn } from './utils'
import { useTheme } from './theme'
import { Spinner } from './Spinner'
import { useSafeArea } from '../canvas/DeviceFrame'

export interface ScreenProps {
  children: React.ReactNode
  className?: string
  /** Background style */
  bg?: 'primary' | 'secondary' | 'transparent'
  /** Safe area padding */
  safeArea?: boolean
  /** Enable scrolling */
  scroll?: boolean
  /** Header component (fixed at top) */
  header?: React.ReactNode
  /** Footer component (fixed at bottom) */
  footer?: React.ReactNode
  /** Tab bar component (fixed at bottom, below footer) */
  tabBar?: React.ReactNode
}

/**
 * Screen - Full-screen container for mobile app content
 */
export function Screen({
  children,
  className,
  bg = 'primary',
  safeArea = true,
  scroll = true,
  header,
  footer,
  tabBar,
}: ScreenProps) {
  const { colors } = useTheme()
  const insets = useSafeArea()

  const getBgColor = () => {
    switch (bg) {
      case 'primary': return colors.surface
      case 'secondary': return colors.background
      case 'transparent': return 'transparent'
    }
  }

  return (
    <div
      className={cn(
        'relative flex flex-col h-full w-full',
        className
      )}
      style={{
        backgroundColor: getBgColor(),
        paddingTop: safeArea ? insets.top : 0,
      }}
    >
      {/* Fixed header */}
      {header}

      {/* Scrollable content area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-0',
          scroll && 'overflow-y-auto'
        )}
      >
        {children}
      </div>

      {/* Fixed footer */}
      {footer}

      {/* Tab bar with safe area */}
      {tabBar && (
        <div style={{ paddingBottom: safeArea ? insets.bottom : 0 }}>
          {tabBar}
        </div>
      )}
    </div>
  )
}

Screen.displayName = 'Screen'

// ScrollView with pull-to-refresh
export interface ScrollViewProps {
  children: React.ReactNode
  className?: string
  /** Enable pull-to-refresh */
  onRefresh?: () => Promise<void>
  /** Refresh indicator text */
  refreshText?: string
  /** Content padding */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Horizontal scroll */
  horizontal?: boolean
  /** Show scrollbar */
  showScrollbar?: boolean
}

export function ScrollView({
  children,
  className,
  onRefresh,
  refreshText = 'Pull to refresh',
  padding = 'none',
  horizontal = false,
  showScrollbar = false,
}: ScrollViewProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const scrollRef = useRef<HTMLDivElement>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onRefresh || refreshing) return
    startY.current = e.touches[0].clientY
  }, [onRefresh, refreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!onRefresh || refreshing) return
    if (!scrollRef.current || scrollRef.current.scrollTop > 0) return

    const currentY = e.touches[0].clientY
    const distance = Math.max(0, (currentY - startY.current) * 0.5)
    setPullDistance(Math.min(distance, 80))
  }, [onRefresh, refreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!onRefresh || refreshing) return

    if (pullDistance >= 60) {
      setRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
      }
    }
    setPullDistance(0)
  }, [onRefresh, refreshing, pullDistance])

  return (
    <div className="relative flex-1 min-h-0">
      {/* Pull-to-refresh indicator */}
      {onRefresh && (pullDistance > 0 || refreshing) && (
        <div
          className="absolute left-0 right-0 flex items-center justify-center z-10"
          style={{
            top: 0,
            height: refreshing ? 50 : pullDistance,
            transition: refreshing ? 'height 0.2s' : undefined,
          }}
        >
          {refreshing ? (
            <Spinner size="sm" />
          ) : (
            <div
              className="text-xs"
              style={{
                color: colors.textSecondary,
                opacity: pullDistance / 60,
              }}
            >
              {pullDistance >= 60 ? 'Release to refresh' : refreshText}
            </div>
          )}
        </div>
      )}

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className={cn(
          'h-full',
          horizontal ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto overflow-x-hidden',
          !showScrollbar && 'scrollbar-hide',
          paddingClasses[padding],
          className
        )}
        style={{
          transform: pullDistance > 0 || refreshing ? `translateY(${refreshing ? 50 : pullDistance}px)` : undefined,
          transition: !pullDistance ? 'transform 0.2s' : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {horizontal ? (
          <div className="flex gap-4 min-w-min">{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

ScrollView.displayName = 'ScrollView'

// Section component for grouped content
export interface SectionProps {
  children: React.ReactNode
  title?: string
  footer?: string
  className?: string
}

export function Section({ children, title, footer, className }: SectionProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  return (
    <div className={cn('mb-6', className)}>
      {title && (
        <div
          className={cn(
            'px-4 mb-1',
            isIOS ? 'text-[13px] uppercase' : 'text-sm font-medium'
          )}
          style={{ color: colors.textSecondary }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: isIOS ? '10px' : '12px',
        }}
      >
        {children}
      </div>
      {footer && (
        <div
          className="px-4 mt-1 text-[13px]"
          style={{ color: colors.textSecondary }}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

Section.displayName = 'Section'

// Content wrapper with standard padding
export interface ContentProps {
  children: React.ReactNode
  className?: string
}

export function Content({ children, className }: ContentProps) {
  return (
    <div className={cn('flex-1 px-4 py-4', className)}>
      {children}
    </div>
  )
}

Content.displayName = 'Content'
