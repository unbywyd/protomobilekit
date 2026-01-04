import { useCallback, useMemo } from 'react'
import { useStore } from './store'
import { getConfig } from './config'
import type { Entity, QueryOptions } from './types'

/**
 * useRepo - Full access to a collection
 */
export function useRepo<T extends Entity>(collection: string) {
  const entities = useStore(
    useCallback((s) => s.entities[collection], [collection])
  )
  const getAll = useStore((s) => s.getAll)
  const createEntity = useStore((s) => s.create)
  const updateEntity = useStore((s) => s.update)
  const deleteEntity = useStore((s) => s.delete)
  const queryEntity = useStore((s) => s.query)

  const items = useMemo(() => {
    // re-compute only when this collection changes
    void entities
    return getAll<T>(collection)
  }, [entities, getAll, collection])

  const create = useCallback(
    (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
      return createEntity<T>(collection, data)
    },
    [collection, createEntity]
  )

  const update = useCallback(
    (id: string, data: Partial<T>) => {
      return updateEntity<T>(collection, id, data)
    },
    [collection, updateEntity]
  )

  const remove = useCallback(
    (id: string) => {
      return deleteEntity(collection, id)
    },
    [collection, deleteEntity]
  )

  const find = useCallback(
    (predicate: (item: T) => boolean) => {
      // NOTE: this is a JS-level escape hatch; UBIML should use declarative filters in IR
      void entities
      return queryEntity<T>(collection, predicate)
    },
    [collection, entities, queryEntity]
  )

  return {
    items,
    create,
    update,
    remove,
    find,
  }
}

/**
 * useEntity - Access a single entity by id
 */
export function useEntity<T extends Entity>(collection: string, id: string) {
  const entity = useStore(
    useCallback((s) => (s.entities[collection]?.[id] as T) || null, [collection, id])
  )
  const updateEntity = useStore((s) => s.update)
  const deleteEntity = useStore((s) => s.delete)

  const update = useCallback(
    (data: Partial<T>) => {
      return updateEntity<T>(collection, id, data)
    },
    [collection, id, updateEntity]
  )

  const remove = useCallback(() => {
    return deleteEntity(collection, id)
  }, [collection, id, deleteEntity])

  return {
    entity,
    update,
    remove,
    exists: entity !== null,
  }
}

/**
 * useRelation - Load a related entity by ID field
 *
 * Simple way to fetch related entities without complex populate logic.
 * Returns null if the relation ID is null/undefined or entity not found.
 *
 * @example
 * ```tsx
 * function OrderDetails({ order }: { order: Order }) {
 *   // Load the restaurant related to this order
 *   const restaurant = useRelation<Restaurant>('Restaurant', order.restaurantId)
 *
 *   return (
 *     <View>
 *       <Text>Order #{order.id}</Text>
 *       {restaurant && <Text>From: {restaurant.name}</Text>}
 *     </View>
 *   )
 * }
 *
 * // Multiple relations
 * function OrderCard({ order }: { order: Order }) {
 *   const restaurant = useRelation<Restaurant>('Restaurant', order.restaurantId)
 *   const customer = useRelation<User>('User', order.customerId)
 *   const courier = useRelation<User>('User', order.courierId)
 *
 *   return (
 *     <Card>
 *       <Text>{restaurant?.name}</Text>
 *       <Text>Customer: {customer?.name}</Text>
 *       <Text>Courier: {courier?.name ?? 'Unassigned'}</Text>
 *     </Card>
 *   )
 * }
 * ```
 */
export function useRelation<T extends Entity>(
  collection: string,
  id: string | null | undefined
): T | null {
  const entity = useStore(
    useCallback(
      (s) => {
        if (!id) return null
        return (s.entities[collection]?.[id] as T) || null
      },
      [collection, id]
    )
  )

  return entity
}

/**
 * useRelations - Load multiple related entities by ID array
 *
 * @example
 * ```tsx
 * function OrderItems({ order }: { order: Order }) {
 *   const dishes = useRelations<Dish>('Dish', order.dishIds)
 *
 *   return (
 *     <List>
 *       {dishes.map(dish => (
 *         <ListItem key={dish.id} title={dish.name} />
 *       ))}
 *     </List>
 *   )
 * }
 * ```
 */
export function useRelations<T extends Entity>(
  collection: string,
  ids: string[] | null | undefined
): T[] {
  const entities = useStore(
    useCallback(
      (s) => {
        if (!ids || ids.length === 0) return []
        const collectionData = s.entities[collection]
        if (!collectionData) return []
        return ids
          .map((id) => collectionData[id] as T)
          .filter((e): e is T => e !== undefined)
      },
      [collection, ids]
    )
  )

  return entities
}

/**
 * useQuery - Query entities with filter, sort, limit, offset
 *
 * @example
 * ```tsx
 * // Basic query with filter
 * const { items: pending } = useQuery<Order>('Order', {
 *   filter: (o) => o.status === 'pending',
 * })
 *
 * // Pagination example
 * const [page, setPage] = useState(0)
 * const PAGE_SIZE = 10
 *
 * const { items, total, hasMore } = useQuery<Order>('Order', {
 *   sort: (a, b) => b.createdAt - a.createdAt,
 *   offset: page * PAGE_SIZE,
 *   limit: PAGE_SIZE,
 * })
 * ```
 */
export function useQuery<T extends Entity>(
  collection: string,
  options: QueryOptions<T> = {}
) {
  const entities = useStore(
    useCallback((s) => s.entities[collection], [collection])
  )
  const getAll = useStore((s) => s.getAll)

  const result = useMemo(() => {
    // re-compute only when this collection changes or options change
    void entities
    let items = getAll<T>(collection)

    // Apply filter
    if (options.filter) {
      items = items.filter(options.filter)
    }

    // Store total count before pagination
    const total = items.length

    // Apply sort
    if (options.sort) {
      items = [...items].sort(options.sort)
    }

    // Apply offset (skip)
    const offset = options.offset ?? 0
    if (offset > 0) {
      items = items.slice(offset)
    }

    // Apply limit
    if (options.limit && options.limit > 0) {
      items = items.slice(0, options.limit)
    }

    return { items, total }
  }, [entities, getAll, collection, options.filter, options.sort, options.limit, options.offset])

  return {
    items: result.items,
    count: result.items.length,
    total: result.total,
    isEmpty: result.items.length === 0,
    hasMore: (options.offset ?? 0) + result.items.length < result.total,
  }
}

/**
 * useSync - Manual sync control
 */
export function useSync() {
  const setSyncing = useStore((s) => s._setSyncing)
  const setLastSyncAt = useStore((s) => s._setLastSyncAt)
  const mergeData = useStore((s) => s._mergeData)
  const getData = useStore((s) => s._getData)
  const isSyncing = useStore((s) => s._isSyncing)
  const lastSyncAt = useStore((s) => s._lastSyncAt)
  const config = getConfig()

  const pull = useCallback(async () => {
    if (!config.data?.onPull) return

    setSyncing(true)
    try {
      const remoteData = await config.data.onPull()
      mergeData(remoteData)
      setLastSyncAt(Date.now())
    } finally {
      setSyncing(false)
    }
  }, [config.data?.onPull, mergeData, setLastSyncAt, setSyncing])

  const push = useCallback(async () => {
    if (!config.data?.onPush) return

    setSyncing(true)
    try {
      const localData = getData()
      await config.data.onPush(localData)
      setLastSyncAt(Date.now())
    } finally {
      setSyncing(false)
    }
  }, [config.data?.onPush, getData, setLastSyncAt, setSyncing])

  return {
    pull,
    push,
    isSyncing,
    lastSyncAt,
  }
}
