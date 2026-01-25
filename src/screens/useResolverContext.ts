import { useMemo } from 'react'
import { useStore } from '../core/store'
import { useAuth } from '../auth/hooks'
import { useAppContext } from '../canvas/Canvas'
import { getFixtureRef } from '../fixtures/store'
import type { ResolverContext, EntityMap, FixtureRefs, EntityRepo } from './types'

type GetAllFn = (collection: string) => unknown[]
type GetByIdFn = (collection: string, id: string) => unknown | null

/**
 * Создаёт EntityRepo для доступа к сущностям
 */
function createEntityRepo<T>(
  collection: string,
  getAll: GetAllFn,
  getById: GetByIdFn
): EntityRepo<T> {
  return {
    first: () => {
      const items = getAll(collection) as T[]
      return items[0]
    },
    get: (id: string) => {
      return (getById(collection, id) as T | null) ?? undefined
    },
    all: () => {
      return getAll(collection) as T[]
    },
    find: (predicate: (item: T) => boolean) => {
      const items = getAll(collection) as T[]
      return items.find(predicate)
    },
  }
}

/**
 * Hook для получения ResolverContext
 * Используется в ScreenRenderer и v2 экранах
 *
 * @example
 * function MyScreen() {
 *   const ctx = useResolverContext()
 *   const restaurant = ctx.repo('Restaurant').first()
 *   const defaultId = ctx.ref('customer', 'defaultRestaurantId')
 * }
 */
export function useResolverContext(): ResolverContext {
  const appContext = useAppContext()
  const { user } = useAuth()
  const { getAll, getById } = useStore()

  // Wrap store methods to match expected types
  const getAllFn: GetAllFn = (c) => getAll(c)
  const getByIdFn: GetByIdFn = (c, id) => getById(c, id)

  return useMemo<ResolverContext>(() => ({
    repo: <K extends keyof EntityMap>(entity: K): EntityRepo<EntityMap[K]> => {
      return createEntityRepo<EntityMap[K]>(
        entity as string,
        getAllFn,
        getByIdFn
      )
    },

    ref: <A extends keyof FixtureRefs>(
      app: A,
      key: keyof FixtureRefs[A]
    ): string | undefined => {
      return getFixtureRef(app, key)
    },

    user,
    appId: appContext?.appId ?? 'default',
  }), [appContext?.appId, user, getAllFn, getByIdFn])
}

/**
 * Создаёт ResolverContext без React hooks
 * Для использования вне компонентов (например в scenarios)
 */
export function createResolverContext(appId: string): ResolverContext {
  const store = useStore.getState()

  const getAllFn: GetAllFn = (c) => store.getAll(c)
  const getByIdFn: GetByIdFn = (c, id) => store.getById(c, id)

  return {
    repo: <K extends keyof EntityMap>(entity: K): EntityRepo<EntityMap[K]> => {
      return createEntityRepo<EntityMap[K]>(
        entity as string,
        getAllFn,
        getByIdFn
      )
    },

    ref: <A extends keyof FixtureRefs>(
      app: A,
      key: keyof FixtureRefs[A]
    ): string | undefined => {
      return getFixtureRef(app, key)
    },

    user: null, // Вне React нет доступа к auth hooks
    appId,
  }
}
