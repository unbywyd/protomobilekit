// Event definition types
export interface EventDefinition<T = unknown> {
  name: string
  payload?: T
}

export type EventsDefinition = Record<string, unknown>

// Event with metadata
export interface EventRecord<T = unknown> {
  id: string
  name: string
  payload: T
  timestamp: number
  source?: string
}

// Event handler
export type EventHandler<T = unknown> = (payload: T, event: EventRecord<T>) => void

// Event bus state
export interface EventBusState {
  handlers: Map<string, Set<EventHandler<unknown>>>
  history: EventRecord[]
  maxHistory: number
}
