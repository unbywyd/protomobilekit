import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Store, Entity, StoreState } from './types'
import { eventBus } from '../events/bus'

const generateId = (): string => {
  // Prefer crypto-grade UUID when available
  const cryptoObj = globalThis.crypto as Crypto | undefined
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID()
  return `id_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`
}

const initialState: StoreState = {
  entities: {},
  _lastSyncAt: null,
  _isSyncing: false,
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Create entity
      create: <T extends Entity>(
        collection: string,
        data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
        options?: { silent?: boolean }
      ): T => {
        const now = Date.now()
        // Use provided id or generate new one
        const id = (data as { id?: string }).id || generateId()
        const entity = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        } as T

        set((state) => ({
          entities: {
            ...state.entities,
            [collection]: {
              ...state.entities[collection],
              [entity.id]: entity,
            },
          },
        }))

        // Dispatch event (unless silent)
        if (!options?.silent) {
          eventBus.dispatch('entity:created', { collection, entity }, 'store')
        }

        return entity
      },

      // Update entity
      update: <T extends Entity>(
        collection: string,
        id: string,
        data: Partial<T>
      ): T | null => {
        const state = get()
        const existing = state.entities[collection]?.[id]

        if (!existing) return null

        const updated = {
          ...existing,
          ...data,
          id, // Prevent id override
          updatedAt: Date.now(),
        } as T

        set((state) => ({
          entities: {
            ...state.entities,
            [collection]: {
              ...state.entities[collection],
              [id]: updated,
            },
          },
        }))

        // Dispatch event
        eventBus.dispatch('entity:updated', { collection, id, changes: data, entity: updated }, 'store')

        return updated
      },

      // Delete entity
      delete: (collection: string, id: string): boolean => {
        const state = get()
        const entity = state.entities[collection]?.[id]
        if (!entity) return false

        set((state) => {
          const { [id]: _, ...rest } = state.entities[collection] || {}
          return {
            entities: {
              ...state.entities,
              [collection]: rest,
            },
          }
        })

        // Dispatch event
        eventBus.dispatch('entity:deleted', { collection, id, entity }, 'store')

        return true
      },

      // Get all entities from collection
      getAll: <T extends Entity>(collection: string): T[] => {
        const state = get()
        const data = state.entities[collection] || {}
        return Object.values(data) as T[]
      },

      // Get entity by id
      getById: <T extends Entity>(collection: string, id: string): T | null => {
        const state = get()
        return (state.entities[collection]?.[id] as T) || null
      },

      // Query entities with predicate
      query: <T extends Entity>(
        collection: string,
        predicate: (item: T) => boolean
      ): T[] => {
        const state = get()
        const data = state.entities[collection] || {}
        return (Object.values(data) as T[]).filter(predicate)
      },

      // Internal sync methods
      _setSyncing: (value: boolean) => set({ _isSyncing: value }),
      _setLastSyncAt: (value: number) => set({ _lastSyncAt: value }),

      _mergeData: (data: Record<string, Record<string, Entity>>) => {
        set((state) => {
          const merged = { ...state.entities }

          for (const [collection, items] of Object.entries(data)) {
            merged[collection] = {
              ...merged[collection],
              ...items,
            }
          }

          return { entities: merged }
        })
      },

      _getData: () => get().entities,
    }),
    {
      name: 'mobilekit-storage',
      partialize: (state) => ({
        entities: state.entities,
        _lastSyncAt: state._lastSyncAt,
      }),
    }
  )
)

// Reset store (useful for testing)
export const resetStore = () => {
  // Only reset data fields, not methods (partial update)
  useStore.setState({
    entities: {},
    _lastSyncAt: null,
    _isSyncing: false,
  })
  // Best-effort: also clear persisted storage so refresh doesn't restore old data
  try {
    useStore.persist?.clearStorage?.()
  } catch {
    // ignore
  }
}
