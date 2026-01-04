import type { EventsDefinition } from './types'
import { dispatch } from './bus'

// Type-safe event dispatcher
export type TypedDispatcher<T extends EventsDefinition> = {
  [K in keyof T]: (payload: T[K]) => void
}

/**
 * defineEvents - Create type-safe event dispatchers
 *
 * @example
 * const events = defineEvents<{
 *   'order:created': { orderId: string }
 *   'order:updated': { orderId: string; status: string }
 * }>()
 *
 * events['order:created']({ orderId: '123' })
 */
export function defineEvents<T extends EventsDefinition>(): TypedDispatcher<T> {
  return new Proxy({} as TypedDispatcher<T>, {
    get(_, eventName: string) {
      return (payload: unknown) => {
        dispatch(eventName, payload)
      }
    },
  })
}

/**
 * createEvent - Create a single event dispatcher
 *
 * @example
 * const orderCreated = createEvent<{ orderId: string }>('order:created')
 * orderCreated({ orderId: '123' })
 */
export function createEvent<T>(eventName: string) {
  return (payload: T, source?: string) => {
    return dispatch(eventName, payload, source)
  }
}
