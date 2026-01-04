import { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import { eventBus, dispatch as busDispatch } from './bus'
import type { EventHandler, EventRecord } from './types'

/**
 * useEvent - Subscribe to an event
 */
export function useEvent<T>(eventName: string, handler: EventHandler<T>): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const stableHandler: EventHandler<T> = (payload, event) => {
      handlerRef.current(payload, event)
    }

    return eventBus.subscribe(eventName, stableHandler)
  }, [eventName])
}

/**
 * useDispatch - Get dispatch function for events
 */
export function useDispatch<T = unknown>(
  eventName?: string
): (payloadOrName: T | string, payload?: T) => EventRecord<T> {
  return useCallback(
    (payloadOrName: T | string, payload?: T) => {
      if (eventName) {
        // Dispatch to predefined event
        return busDispatch(eventName, payloadOrName as T)
      } else {
        // Dynamic event name
        return busDispatch(payloadOrName as string, payload as T)
      }
    },
    [eventName]
  )
}

/**
 * useEventHistory - Get event history with optional filter
 */
export function useEventHistory(filter?: string | string[]): EventRecord[] {
  const [history, setHistory] = useState<EventRecord[]>([])

  const filterNames = useMemo(() => {
    if (!filter) return null
    return new Set(Array.isArray(filter) ? filter : [filter])
  }, [filter])

  const updateHistory = useCallback(() => {
    let events = eventBus.getHistory()
    if (filterNames) {
      events = events.filter((e) => filterNames.has(e.name))
    }
    setHistory(events)
  }, [filterNames])

  useEffect(() => {
    updateHistory()
    // Subscribe to all events; wildcard support is implemented in the bus
    return eventBus.subscribe('*', () => updateHistory())
  }, [updateHistory])

  return history
}

/**
 * useLatestEvent - Get the most recent event of a type
 */
export function useLatestEvent<T>(eventName: string): EventRecord<T> | null {
  const [latest, setLatest] = useState<EventRecord<T> | null>(null)

  useEvent<T>(eventName, (payload, event) => {
    setLatest(event)
  })

  return latest
}
