import React from 'react'
import { cn, scrollbarStyles } from '../ui/utils'
import { useCanvasState } from '../canvas/useCanvasState'
import type { AppDefinition } from '../canvas/types'

export interface AppsPanelProps {
  /** Available apps (passed from Canvas context) */
  apps?: AppDefinition[]
  /** Embedded mode */
  embedded?: boolean
  className?: string
}

// Icons
function EyeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function MaximizeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  )
}

function MinimizeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    </svg>
  )
}

function PhoneIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  )
}

/**
 * AppsPanel - DevTools panel for managing app visibility and fullscreen
 */
export function AppsPanel({ apps = [], embedded = false, className }: AppsPanelProps) {
  const {
    hiddenApps,
    fullscreenApp,
    toggleAppVisibility,
    showAllApps,
    toggleFullscreen,
    exitFullscreen,
  } = useCanvasState()

  const hiddenCount = hiddenApps.size
  const hasHiddenApps = hiddenCount > 0

  return (
    <div className={cn(
      'flex flex-col',
      embedded ? 'h-full' : 'min-h-[200px]',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/50">
        <div className="flex items-center gap-2">
          <PhoneIcon size={14} />
          <span className="text-xs font-medium text-neutral-300">
            Apps ({apps.length})
          </span>
          {hasHiddenApps && (
            <span className="text-xs text-neutral-500">
              ({hiddenCount} hidden)
            </span>
          )}
        </div>
        {hasHiddenApps && (
          <button
            onClick={showAllApps}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Show all
          </button>
        )}
      </div>

      {/* Fullscreen notice */}
      {fullscreenApp && (
        <div className="px-4 py-2 bg-blue-500/10 border-b border-blue-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-400">
              Fullscreen: {apps.find(a => a.id === fullscreenApp)?.name || fullscreenApp}
            </span>
            <button
              onClick={exitFullscreen}
              className="text-xs text-blue-300 hover:text-white transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Apps list */}
      <div className={cn('flex-1 overflow-y-auto', scrollbarStyles)}>
        {apps.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-500">
            No apps registered
          </div>
        ) : (
          <div className="py-2">
            {apps.map(app => {
              const isVisible = !hiddenApps.has(app.id)
              const isFullscreen = fullscreenApp === app.id

              return (
                <div
                  key={app.id}
                  className={cn(
                    'flex items-center justify-between px-4 py-2 hover:bg-neutral-800/50 transition-colors',
                    !isVisible && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Visibility toggle */}
                    <button
                      onClick={() => toggleAppVisibility(app.id)}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        isVisible
                          ? 'text-green-400 hover:bg-green-500/20'
                          : 'text-neutral-500 hover:bg-neutral-700'
                      )}
                      title={isVisible ? 'Hide app' : 'Show app'}
                    >
                      {isVisible ? <EyeIcon size={14} /> : <EyeOffIcon size={14} />}
                    </button>

                    {/* App info */}
                    <div>
                      <div className="text-sm font-medium text-neutral-200">
                        {app.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {app.id}
                      </div>
                    </div>
                  </div>

                  {/* Fullscreen toggle */}
                  <button
                    onClick={() => toggleFullscreen(app.id)}
                    className={cn(
                      'p-1.5 rounded transition-colors',
                      isFullscreen
                        ? 'text-blue-400 bg-blue-500/20'
                        : 'text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300'
                    )}
                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? <MinimizeIcon size={14} /> : <MaximizeIcon size={14} />}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-neutral-800/50">
        <p className="text-[10px] text-neutral-600">
          Toggle visibility to focus on specific apps. Fullscreen mode removes the device frame for mobile testing.
        </p>
      </div>
    </div>
  )
}

AppsPanel.displayName = 'AppsPanel'
