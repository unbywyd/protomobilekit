import React, { useState, useEffect, useRef, useCallback } from 'react'
import { StateInspector } from './StateInspector'
import { EventLog } from './EventLog'
import { AuthPanel } from './AuthPanel'
import { FlowsPanel } from './FlowsPanel'
import { AppsPanel } from './AppsPanel'
import { FrameBrowser } from '../frames/FrameBrowser'
import { useAppsRegistry } from '../canvas/useAppsRegistry'
import { cn, scrollbarStyles, scrollbarHide } from '../ui/utils'
import { DatabaseIcon, ActivityIcon, CloseIcon, TerminalIcon, FramesIcon, UsersIcon, FlowIcon, AppsIcon } from './icons'

// Check if device is mobile (by screen width only, not touch capability)
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 768
}

export type DevToolsTab = 'state' | 'events' | 'frames' | 'auth' | 'flows' | 'apps'

export interface DevToolsProps {
  /** Show state inspector */
  showState?: boolean
  /** Show event log */
  showEvents?: boolean
  /** Show frames browser */
  showFrames?: boolean
  /** Show auth panel */
  showAuth?: boolean
  /** Show flows panel */
  showFlows?: boolean
  /** Show apps panel (visibility & fullscreen) */
  showApps?: boolean
  /** Initial tab */
  defaultTab?: DevToolsTab
  /** Position */
  position?: 'left' | 'right'
  /** Only show in development mode */
  devOnly?: boolean
  /** Enable dragging */
  draggable?: boolean
  className?: string
}

/**
 * DevTools - Combined dev tools panel
 */
const STORAGE_KEY = 'devtools-collapsed'
const STORAGE_POSITION_KEY = 'devtools-position'

export function DevTools({
  showState = true,
  showEvents = true,
  showFrames = true,
  showAuth = true,
  showFlows = true,
  showApps = true,
  defaultTab = 'apps',
  position = 'right',
  devOnly = true,
  draggable = true,
  className,
}: DevToolsProps) {
  const [activeTab, setActiveTab] = useState<DevToolsTab>(defaultTab)
  const apps = useAppsRegistry()
  const panelRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const positionRef = useRef({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(() => isMobileDevice())

  // Track mobile state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Initialize collapsed state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'true'
  })

  // Initialize position from localStorage
  const [panelPosition, setPanelPosition] = useState<{ x: number; y: number } | null>(() => {
    if (typeof window === 'undefined' || !draggable) return null
    try {
      const stored = localStorage.getItem(STORAGE_POSITION_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { x: parsed.x ?? 0, y: parsed.y ?? 0 }
      }
    } catch {
      // Ignore parse errors
    }
    return null
  })

  // Sync collapsed state with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    }
  }, [collapsed])

  // Save position to localStorage
  const savePosition = useCallback((x: number, y: number) => {
    if (typeof window !== 'undefined' && draggable) {
      try {
        localStorage.setItem(STORAGE_POSITION_KEY, JSON.stringify({ x, y }))
      } catch {
        // Ignore storage errors
      }
    }
  }, [draggable])

  // Constrain position within viewport bounds
  const constrainPosition = useCallback((x: number, y: number, width: number, height: number) => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Constrain horizontally
    const minX = 0
    const maxX = viewportWidth - width
    const constrainedX = Math.max(minX, Math.min(maxX, x))
    
    // Constrain vertically
    const minY = 0
    const maxY = viewportHeight - height
    const constrainedY = Math.max(minY, Math.min(maxY, y))
    
    return { x: constrainedX, y: constrainedY }
  }, [])

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !panelRef.current) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const rect = panelRef.current.getBoundingClientRect()
    const newX = clientX - dragStartRef.current.x
    const newY = clientY - dragStartRef.current.y
    
    const constrained = constrainPosition(newX, newY, rect.width, rect.height)
    
    positionRef.current = constrained
    setPanelPosition(constrained)
    
    if ('touches' in e) {
      e.preventDefault()
    }
  }, [constrainPosition])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return
    
    isDraggingRef.current = false
    setIsDragging(false)
    if (positionRef.current) {
      savePosition(positionRef.current.x, positionRef.current.y)
    }
  }, [savePosition])

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!draggable || !panelRef.current) return
    
    isDraggingRef.current = true
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const rect = panelRef.current.getBoundingClientRect()
    dragStartRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
    positionRef.current = {
      x: rect.left,
      y: rect.top,
    }
    
    // Initialize position if not set
    if (!panelPosition) {
      setPanelPosition({ x: rect.left, y: rect.top })
    }
    
    // Add event listeners for drag
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e)
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e)
    const handleMouseUp = () => {
      handleDragEnd()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    const handleTouchEnd = () => {
      handleDragEnd()
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp, { once: true })
    document.addEventListener('touchend', handleTouchEnd, { once: true })
    
    e.preventDefault()
  }, [draggable, handleDragMove, handleDragEnd, panelPosition])

  // Apply saved position constraints on mount and window resize
  useEffect(() => {
    if (!draggable || !panelRef.current) return

    const applyConstraints = () => {
      if (panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect()
        const currentPos = panelPosition || { x: 0, y: 0 }
        const constrained = constrainPosition(currentPos.x, currentPos.y, rect.width, rect.height)
        
        if (constrained.x !== currentPos.x || constrained.y !== currentPos.y) {
          setPanelPosition(constrained)
          savePosition(constrained.x, constrained.y)
        } else if (panelPosition) {
          // Ensure saved position is applied
          setPanelPosition(constrained)
        }
      }
    }

    // Apply constraints after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(applyConstraints, 0)
    
    const handleResize = () => {
      applyConstraints()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
    }
  }, [draggable, constrainPosition, savePosition])

  // Client-safe dev check
  const viteDev =
    typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    typeof (import.meta as any).env.DEV === 'boolean' &&
    (import.meta as any).env.DEV

  const nodeEnv = (globalThis as any).process?.env?.NODE_ENV as string | undefined
  const bundlerDev = typeof nodeEnv === 'string' && nodeEnv !== 'production'

  const isDev = Boolean(viteDev || bundlerDev)

  if (devOnly && !isDev) return null

  // Calculate position styles
  const getPositionStyles = (): React.CSSProperties => {
    if (draggable && panelPosition && typeof window !== 'undefined') {
      // Calculate max height based on current top position to prevent overflow
      const topOffset = panelPosition.y
      const bottomPadding = 16 // 1rem padding at bottom
      const viewportHeight = window.innerHeight
      const maxHeight = Math.max(200, viewportHeight - topOffset - bottomPadding) // Minimum 200px height
      
      return {
        left: `${panelPosition.x}px`,
        top: `${panelPosition.y}px`,
        right: 'auto',
        bottom: 'auto',
        maxHeight: `${maxHeight}px`,
        height: 'auto',
      }
    }
    if (draggable) {
      // Default position when draggable but no saved position
      return {
        top: '1rem',
        [position === 'right' ? 'right' : 'left']: '1rem',
        maxHeight: 'calc(100vh - 2rem)',
        height: 'auto',
      }
    }
    return {
      top: '1rem',
      bottom: '1rem',
      [position === 'right' ? 'right' : 'left']: '1rem',
    }
  }

  if (collapsed) {
    // On desktop use drag position, on mobile fixed bottom-right
    const collapsedPosition = draggable && panelPosition
      ? { left: `${panelPosition.x}px`, top: `${panelPosition.y}px` }
      : position === 'right' ? { right: '1rem' } : { left: '1rem' }

    return (
      <button
        onClick={() => setCollapsed(false)}
        style={collapsedPosition}
        className={cn(
          'fixed z-50 flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-neutral-900 border border-neutral-800 text-neutral-300',
          'hover:bg-neutral-800 hover:text-white transition-all',
          'text-xs font-medium shadow-xl',
          // Mobile: fixed bottom-right (override inline styles)
          'max-[768px]:!top-auto max-[768px]:!left-auto max-[768px]:!right-4 max-[768px]:!bottom-4',
          // Desktop: top position
          'min-[769px]:top-4',
          !draggable && (position === 'right' ? 'min-[769px]:right-4' : 'min-[769px]:left-4'),
          className
        )}
      >
        <TerminalIcon size={14} />
        <span className="hidden min-[769px]:inline">DevTools</span>
      </button>
    )
  }

  // Use CSS-based responsive - panel uses media queries
  // On mobile (<= 768px): full width at bottom, no drag position
  // On desktop: use saved drag position or default
  const panelStyles = getPositionStyles()

  return (
    <div
      ref={panelRef}
      style={panelStyles}
      className={cn(
        'fixed z-50 overflow-hidden',
        'bg-neutral-950 border border-neutral-800 shadow-2xl',
        'flex flex-col',
        // Mobile: fullscreen (CSS overrides inline styles)
        'max-[768px]:!inset-0 max-[768px]:!top-0 max-[768px]:!left-0 max-[768px]:!right-0 max-[768px]:!bottom-0',
        'max-[768px]:!max-h-none max-[768px]:!h-full max-[768px]:!w-full max-[768px]:rounded-none',
        // Desktop: fixed width
        'min-[769px]:w-[490px] min-[769px]:rounded-xl',
        !draggable && (position === 'right' ? 'min-[769px]:right-4' : 'min-[769px]:left-4'),
        !draggable && 'min-[769px]:top-4 min-[769px]:bottom-4',
        className
      )}
    >
      {/* Header - draggable handle */}
      <div
        ref={dragHandleRef}
        onMouseDown={!isMobile && draggable ? handleDragStart : undefined}
        onTouchStart={!isMobile && draggable ? handleDragStart : undefined}
        className={cn(
          'flex items-center justify-between px-1 py-1 border-b border-neutral-800/50 shrink-0',
          'min-[769px]:cursor-move min-[769px]:select-none',
          isDragging && 'opacity-90'
        )}
      >
        {/* Tabs - icons only on mobile */}
        <div className={cn(
          'flex flex-1',
          scrollbarHide
        )}>
          {showState && (
            <button
              onClick={() => setActiveTab('state')}
              className={cn(
                'flex items-center gap-1.5 px-2 py-2 text-xs font-medium rounded-lg transition-all shrink-0',
                'min-[769px]:px-3',
                activeTab === 'state'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              <DatabaseIcon size={14} />
              <span className="hidden min-[769px]:inline">State</span>
            </button>
          )}
          {showEvents && (
            <button
              onClick={() => setActiveTab('events')}
              className={cn(
                'flex items-center gap-1.5 px-2 py-2 text-xs font-medium rounded-lg transition-all shrink-0',
                'min-[769px]:px-3',
                activeTab === 'events'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              <ActivityIcon size={14} />
              <span className="hidden min-[769px]:inline">Events</span>
            </button>
          )}
          {showFrames && (
            <button
              onClick={() => setActiveTab('frames')}
              className={cn(
                'flex items-center gap-1.5 px-2 py-2 text-xs font-medium rounded-lg transition-all shrink-0',
                'min-[769px]:px-3',
                activeTab === 'frames'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              <FramesIcon size={14} />
              <span className="hidden min-[769px]:inline">Frames</span>
            </button>
          )}
          {showAuth && (
            <button
              onClick={() => setActiveTab('auth')}
              className={cn(
                'flex items-center gap-1.5 px-2 py-2 text-xs font-medium rounded-lg transition-all shrink-0',
                'min-[769px]:px-3',
                activeTab === 'auth'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              <UsersIcon size={14} />
              <span className="hidden min-[769px]:inline">Auth</span>
            </button>
          )}
          {showFlows && (
            <button
              onClick={() => setActiveTab('flows')}
              className={cn(
                'flex items-center gap-1.5 px-2 py-2 text-xs font-medium rounded-lg transition-all shrink-0',
                'min-[769px]:px-3',
                activeTab === 'flows'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              <FlowIcon size={14} />
              <span className="hidden min-[769px]:inline">Flows</span>
            </button>
          )}
          {showApps && (
            <button
              onClick={() => setActiveTab('apps')}
              className={cn(
                'flex items-center gap-1.5 px-2 py-2 text-xs font-medium rounded-lg transition-all shrink-0',
                'min-[769px]:px-3',
                activeTab === 'apps'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              )}
            >
              <AppsIcon size={14} />
              <span className="hidden min-[769px]:inline">Apps</span>
            </button>
          )}
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-all"
        >
          <CloseIcon size={14} />
        </button>
      </div>

      {/* Content */}
      <div className={cn('flex-1 min-h-0 overflow-y-auto', scrollbarStyles)}>
        {activeTab === 'state' && showState && (
          <StateInspector embedded />
        )}
        {activeTab === 'events' && showEvents && (
          <EventLog embedded />
        )}
        {activeTab === 'frames' && showFrames && (
          <FrameBrowser embedded />
        )}
        {activeTab === 'auth' && showAuth && (
          <AuthPanel embedded />
        )}
        {activeTab === 'flows' && showFlows && (
          <FlowsPanel embedded />
        )}
        {activeTab === 'apps' && showApps && (
          <AppsPanel apps={apps} embedded />
        )}
      </div>
    </div>
  )
}

DevTools.displayName = 'DevTools'
