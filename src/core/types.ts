// Entity types
export interface EntitySchema<T = Record<string, unknown>> {
  name: string
  fields: T
  mock?: () => Partial<T>
}

export interface Entity {
  id: string
  createdAt: number
  updatedAt: number
  [key: string]: unknown
}

// Store types
export interface StoreState {
  entities: Record<string, Record<string, Entity>>
  _lastSyncAt: number | null
  _isSyncing: boolean
}

export interface StoreActions {
  // Entity operations
  create: <T extends Entity>(collection: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }, options?: { silent?: boolean }) => T
  update: <T extends Entity>(collection: string, id: string, data: Partial<T>) => T | null
  delete: (collection: string, id: string) => boolean

  // Query operations
  getAll: <T extends Entity>(collection: string) => T[]
  getById: <T extends Entity>(collection: string, id: string) => T | null
  query: <T extends Entity>(collection: string, predicate: (item: T) => boolean) => T[]

  // Sync operations
  _setSyncing: (value: boolean) => void
  _setLastSyncAt: (value: number) => void
  _mergeData: (data: Record<string, Record<string, Entity>>) => void
  _getData: () => Record<string, Record<string, Entity>>
}

export type Store = StoreState & StoreActions

// Config types
export interface SyncConfig {
  onPull?: () => Promise<Record<string, Record<string, Entity>>>
  onPush?: (data: Record<string, Record<string, Entity>>) => Promise<void>
}

export interface NavigationConfig {
  /** Default transition animation for Navigator */
  animation?: 'slide' | 'fade' | 'none'
  /** Default transition duration (ms) */
  transitionDurationMs?: number
}

export interface MobileKitConfig {
  data?: SyncConfig
  navigation?: NavigationConfig
}

// Query types
export interface QueryOptions<T> {
  /** Filter function to select items */
  filter?: (item: T) => boolean
  /** Sort function */
  sort?: (a: T, b: T) => number
  /** Maximum number of items to return */
  limit?: number
  /** Number of items to skip (for pagination) */
  offset?: number
}
