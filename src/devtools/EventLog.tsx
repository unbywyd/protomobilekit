import React, { useState, useEffect, useCallback } from 'react'
import { eventBus, getEventHistory, clearEventHistory } from '../events/bus'
import { cn, scrollbarStyles } from '../ui/utils'
import type { EventRecord } from '../events/types'
import { ActivityIcon, PlayIcon, PauseIcon, TrashIcon } from './icons'

export interface EventLogProps {
  /** Embedded mode (no positioning, used inside DevTools) */
  embedded?: boolean
  /** Initial collapsed state */
  defaultCollapsed?: boolean
  /** Position */
  position?: 'left' | 'right'
  /** Filter by event names */
  filter?: string[]
  className?: string
}

/**
 * EventLog - Dev tool for viewing event history
 */
export function EventLog({
  embedded = false,
  defaultCollapsed = false,
  position = 'left',
  filter,
  className,
}: EventLogProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [events, setEvents] = useState<EventRecord[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null)
  const [paused, setPaused] = useState(false)

  const update = useCallback(() => {
    let history = getEventHistory()
    if (filter && filter.length > 0) {
      history = history.filter((e) => filter.includes(e.name))
    }
    setEvents([...history].reverse())
  }, [filter])

  // Subscribe for new events (no polling)
  useEffect(() => {
    if (paused) return
    update()
    return eventBus.subscribe('*', () => update())
  }, [paused, update])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // Standalone collapsed button
  if (!embedded && collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className={cn(
          'fixed top-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-neutral-900 border border-neutral-800 text-neutral-300',
          'hover:bg-neutral-800 hover:text-white transition-all',
          'text-xs font-medium shadow-xl',
          position === 'right' ? 'right-4' : 'left-4',
          className
        )}
      >
        <ActivityIcon size={14} />
        Events ({events.length})
      </button>
    )
  }

  const content = (
    <>
      {/* Controls */}
      <div className="flex items-center gap-1 p-2 border-b border-neutral-800/50">
        <button
          onClick={() => setPaused(!paused)}
          className={cn(
            'p-2 rounded-lg transition-all',
            paused
              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          )}
          title={paused ? 'Resume' : 'Pause'}
        >
          {paused ? <PlayIcon size={12} /> : <PauseIcon size={12} />}
        </button>
        <button
          onClick={() => {
            clearEventHistory()
            setEvents([])
          }}
          className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-all"
          title="Clear"
        >
          <TrashIcon size={12} />
        </button>
        <div className="flex-1" />
        <span className="text-[10px] text-neutral-600 tabular-nums">
          {events.length} event{events.length !== 1 ? 's' : ''}
          {paused && ' • paused'}
        </span>
      </div>

      {/* Event list */}
      <div className={cn('flex-1 overflow-y-auto', scrollbarStyles)}>
        {events.length === 0 ? (
          <div className="text-center text-neutral-600 py-8 text-xs">No events</div>
        ) : (
          <div className="p-2 space-y-1">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                className={cn(
                  'w-full text-left p-2 rounded-lg transition-all',
                  selectedEvent?.id === event.id
                    ? 'bg-neutral-800'
                    : 'hover:bg-neutral-800/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-200">{event.name}</span>
                  <span className="text-[10px] text-neutral-600 tabular-nums">{formatTime(event.timestamp)}</span>
                </div>
                {event.source && (
                  <div className="text-[10px] text-neutral-600 mt-0.5">from: {event.source}</div>
                )}
                {selectedEvent?.id === event.id && event.payload !== undefined && (
                  <pre className="mt-2 p-2 bg-neutral-900 border border-neutral-800/50 rounded-lg text-[10px] font-mono text-neutral-400 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )

  // Embedded mode - just return content
  if (embedded) {
    return <div className="flex flex-col min-h-full">{content}</div>
  }

  // Standalone mode
  return (
    <div
      className={cn(
        'fixed top-4 bottom-4 w-72 z-50 rounded-xl overflow-hidden',
        'bg-neutral-950 border border-neutral-800 shadow-2xl',
        'flex flex-col',
        position === 'right' ? 'right-4' : 'left-4',
        className
      )}
    >
      {content}
    </div>
  )
}

EventLog.displayName = 'EventLog'
