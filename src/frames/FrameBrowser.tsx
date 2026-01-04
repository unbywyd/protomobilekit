import React, { useState, useMemo } from 'react'
import { useFrameRegistry } from './hooks'
import { cn, scrollbarStyles } from '../ui/utils'

export interface FrameBrowserProps {
  /** Embedded mode (inside DevTools) */
  embedded?: boolean
  className?: string
}

/**
 * FrameBrowser - DevTool panel showing all registered frames
 *
 * Displays frames grouped by app with thumbnails, names, and descriptions.
 * Click on a frame to navigate to it.
 */
export function FrameBrowser({ embedded = false, className }: FrameBrowserProps) {
  const { apps, frameCount, search, goToFrame } = useFrameRegistry()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set(apps.map(a => a.appId)))

  // Filter frames based on search
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return apps

    const results = search(searchQuery)
    const appFrameMap = new Map<string, typeof results>()

    for (const result of results) {
      const existing = appFrameMap.get(result.app.appId) || []
      existing.push(result)
      appFrameMap.set(result.app.appId, existing)
    }

    return apps
      .map(app => ({
        ...app,
        frames: appFrameMap.get(app.appId)?.map(r => r.frame) || [],
      }))
      .filter(app => app.frames.length > 0)
  }, [apps, searchQuery, search])

  const toggleApp = (appId: string) => {
    setExpandedApps(prev => {
      const next = new Set(prev)
      if (next.has(appId)) {
        next.delete(appId)
      } else {
        next.add(appId)
      }
      return next
    })
  }

  const handleFrameClick = (appId: string, frameId: string) => {
    goToFrame(appId, frameId)
  }

  if (apps.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center h-full text-neutral-500',
        embedded ? 'p-4' : 'p-8'
      )}>
        <FramesIcon size={32} className="mb-2 opacity-50" />
        <p className="text-sm">No frames registered</p>
        <p className="text-xs text-neutral-600 mt-1">
          Use registerFrames() to add frames
        </p>
      </div>
    )
  }

  return (
    <div className={cn(
      'flex flex-col',
      embedded ? 'min-h-full' : 'h-full',
      !embedded && 'bg-neutral-950 text-white',
      className
    )}>
      {/* Header with search */}
      <div className="p-3 border-b border-neutral-800">
        <div className="relative">
          <SearchIcon
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search frames..."
            className={cn(
              'w-full pl-8 pr-3 py-1.5 text-xs rounded-md',
              'bg-neutral-900 border border-neutral-800',
              'text-neutral-200 placeholder:text-neutral-600',
              'focus:outline-none focus:border-neutral-700'
            )}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-neutral-500">
          <span>{filteredApps.length} apps</span>
          <span>{frameCount} frames</span>
        </div>
      </div>

      {/* Frame list */}
      <div className={cn('flex-1 overflow-y-auto overflow-x-hidden', scrollbarStyles)}>
        {filteredApps.map(app => (
          <div key={app.appId} className="border-b border-neutral-800/50">
            {/* App header */}
            <button
              onClick={() => toggleApp(app.appId)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2',
                'hover:bg-neutral-900/50 transition-colors'
              )}
            >
              <div className="flex items-center gap-2">
                <ChevronIcon
                  size={12}
                  className={cn(
                    'text-neutral-500 transition-transform',
                    expandedApps.has(app.appId) && 'rotate-90'
                  )}
                />
                <span className="text-xs font-medium text-neutral-300">
                  {app.appName}
                </span>
              </div>
              <span className="text-xs text-neutral-600">
                {app.frames.length}
              </span>
            </button>

            {/* Frames */}
            {expandedApps.has(app.appId) && (
              <div className="pb-2 pl-4">
                {app.frames.map(frame => (
                  <button
                    key={frame.id}
                    onClick={() => handleFrameClick(app.appId, frame.id)}
                    className={cn(
                      'w-full flex items-start gap-3 px-3 py-2',
                      'hover:bg-neutral-800/50 rounded-md transition-colors',
                      'text-left'
                    )}
                  >
                    {/* Frame thumbnail placeholder */}
                    <div className={cn(
                      'w-10 h-16 rounded border border-neutral-700',
                      'bg-neutral-800 flex-shrink-0',
                      'flex items-center justify-center'
                    )}>
                      <FrameIcon size={14} className="text-neutral-600" />
                    </div>

                    {/* Frame info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-200 truncate">
                        {frame.name}
                      </p>
                      {frame.description && (
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                          {frame.description}
                        </p>
                      )}
                      {frame.tags && frame.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {frame.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 text-[10px] rounded bg-neutral-800 text-neutral-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

FrameBrowser.displayName = 'FrameBrowser'

// Icons
function FramesIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function FrameIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}

function SearchIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function ChevronIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
