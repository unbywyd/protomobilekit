import type { ComponentType } from 'react'
import type { AuthUser } from '../auth/types'

// =============================================================================
// Module Augmentation Interfaces
// Проект расширяет через declare module 'protomobilekit'
// =============================================================================

/**
 * Карта сущностей - проект расширяет через module augmentation
 * @example
 * declare module 'protomobilekit' {
 *   interface EntityMap {
 *     Restaurant: Restaurant
 *     Order: Order
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EntityMap {}

/**
 * Fixture refs - проект расширяет через module augmentation
 * @example
 * declare module 'protomobilekit' {
 *   interface FixtureRefs {
 *     customer: { defaultRestaurantId: string }
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FixtureRefs {}

// =============================================================================
// ViewModel
// =============================================================================

/**
 * ViewModel - всё что нужно экрану для рендера
 */
export interface ViewModel<State = unknown, Actions = unknown> {
  state: State
  actions: Actions
}

// =============================================================================
// ResolverContext
// =============================================================================

/**
 * Репозиторий сущности для ResolverContext
 */
export interface EntityRepo<T> {
  /** Получить первый элемент */
  first: () => T | undefined
  /** Получить по ID */
  get: (id: string) => T | undefined
  /** Получить все элементы */
  all: () => T[]
  /** Найти по предикату */
  find: (predicate: (item: T) => boolean) => T | undefined
}

/**
 * Контекст для резолвинга параметров
 * Типобезопасный доступ к данным через repo()
 */
export interface ResolverContext {
  /**
   * Типобезопасный доступ к репозиторию сущности
   * @example ctx.repo('Restaurant').first()
   */
  repo: <K extends keyof EntityMap>(entity: K) => EntityRepo<EntityMap[K]>

  /**
   * Получить fixture ref по ключу
   * @example ctx.ref('customer', 'defaultRestaurantId')
   */
  ref: <A extends keyof FixtureRefs>(
    app: A,
    key: keyof FixtureRefs[A]
  ) => string | undefined

  /** Текущий пользователь */
  user: AuthUser | null

  /** ID текущего приложения */
  appId: string
}

// =============================================================================
// ResolveResult
// =============================================================================

/**
 * Результат резолвинга параметров
 */
export type ResolveResult<P> =
  | { ok: true; params: P }
  | { ok: false; reason: string; debug?: unknown }

/**
 * Функция резолвинга параметров
 */
export type ParamsResolver<P> = (
  given: Partial<P>,
  ctx: ResolverContext
) => ResolveResult<P>

// =============================================================================
// ParamsCodec
// =============================================================================

/**
 * Кодек для coercion параметров из URL
 */
export interface ParamsCodec<P> {
  /**
   * Coercion из unknown в типизированный объект
   * raw может быть Record<string,string> из URL или уже object из navigate()
   */
  coerce: (raw: Record<string, unknown>) => Partial<P>

  /**
   * Сериализация в строки для URL
   */
  serialize: (params: P) => Record<string, string>
}

// =============================================================================
// ScreenConfig
// =============================================================================

/**
 * Полное определение v2 экрана
 * Ключ в реестре: ${appId}:${navigatorId}:${name}
 */
export interface ScreenConfig<P = unknown, VM extends ViewModel = ViewModel> {
  /** ID приложения (namespace) */
  appId: string

  /** ID навигатора (default: 'main') */
  navigatorId?: string

  /** Имя экрана */
  name: string

  /** View компонент (только рендер) */
  View: ComponentType<{ vm: VM }>

  /** UseCase хук (логика + данные → ViewModel) */
  useCase: (params: P) => VM

  /** Резолвер параметров (возвращает Result) */
  resolveParams?: ParamsResolver<P>

  /**
   * Кодек для coercion параметров
   * Вызывается только если params пришли из URL (строки)
   */
  paramsCodec?: ParamsCodec<P>

  /** Теги для фильтрации в DevTools */
  tags?: string[]

  /** Описание для документации */
  description?: string
}
