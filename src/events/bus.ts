import type { EventHandler, EventRecord, EventBusState } from './types'

// Generate unique event ID
const generateEventId = (): string => {
  const cryptoObj = globalThis.crypto as Crypto | undefined
  if (cryptoObj?.randomUUID) return `evt_${cryptoObj.randomUUID()}`
  return `evt_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`
}

// Event bus singleton
class EventBus {
  private state: EventBusState = {
    handlers: new Map(),
    history: [],
    maxHistory: 100,
  }

  // Subscribe to an event
  subscribe<T>(eventName: string, handler: EventHandler<T>): () => void {
    if (!this.state.handlers.has(eventName)) {
      this.state.handlers.set(eventName, new Set())
    }

    const handlers = this.state.handlers.get(eventName)!
    handlers.add(handler as EventHandler<unknown>)

    // Return unsubscribe function
    return () => {
      handlers.delete(handler as EventHandler<unknown>)
      if (handlers.size === 0) {
        this.state.handlers.delete(eventName)
      }
    }
  }

  // Dispatch an event
  dispatch<T>(eventName: string, payload: T, source?: string): EventRecord<T> {
    const event: EventRecord<T> = {
      id: generateEventId(),
      name: eventName,
      payload,
      timestamp: Date.now(),
      source,
    }

    // Add to history
    this.state.history.push(event as EventRecord<unknown>)
    if (this.state.history.length > this.state.maxHistory) {
      this.state.history.shift()
    }

    // Notify handlers (specific + wildcard "*")
    const notify = (handlers?: Set<EventHandler<unknown>>) => {
      if (!handlers) return
      handlers.forEach((handler) => {
        try {
          handler(payload, event as EventRecord<unknown>)
        } catch (error) {
          console.error(`Error in event handler for "${eventName}":`, error)
        }
      })
    }

    notify(this.state.handlers.get(eventName))
    notify(this.state.handlers.get('*'))

    return event
  }

  // Get event history
  getHistory(): EventRecord[] {
    return [...this.state.history]
  }

  // Clear event history
  clearHistory(): void {
    this.state.history = []
  }

  // Set max history size
  setMaxHistory(max: number): void {
    this.state.maxHistory = max
    while (this.state.history.length > max) {
      this.state.history.shift()
    }
  }

  // Clear all handlers (useful for testing)
  clearHandlers(): void {
    this.state.handlers.clear()
  }

  // Reset entire bus
  reset(): void {
    this.clearHandlers()
    this.clearHistory()
  }
}

// Singleton instance
export const eventBus = new EventBus()

// Helper functions
export const dispatch = <T>(eventName: string, payload: T, source?: string) =>
  eventBus.dispatch(eventName, payload, source)

export const subscribe = <T>(eventName: string, handler: EventHandler<T>) =>
  eventBus.subscribe(eventName, handler)

export const getEventHistory = () => eventBus.getHistory()

export const clearEventHistory = () => eventBus.clearHistory()
