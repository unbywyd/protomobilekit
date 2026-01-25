# ProtoMobileKit v2 - Screen Architecture

## Принцип

**Экраны = тупые View компоненты.** Они не знают откуда данные, в каком режиме запущены, как резолвятся параметры. Вся логика вынесена в useCase хуки, а параметры резолвятся на уровне runtime.

```
URL/DevTools/Navigation
        ↓
   rawParams (string из hash или object из navigate())
        ↓
   coerceParams(raw) → typed Partial<P>
        ↓
   resolveParams(given, ctx) → Result<P>
        ↓
   useCase(params) → ViewModel
        ↓
   View({ vm }) → UI
```

---

## 1. Типы и контракты

### 1.1 Базовые типы

```tsx
// src/screens/types.ts

/**
 * ViewModel - всё что нужно экрану для рендера
 */
export interface ViewModel<State = any, Actions = any> {
  state: State
  actions: Actions
}

/**
 * Результат резолвинга - либо успех, либо ошибка с причиной
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
```

### 1.2 Type Safety через Module Augmentation

Библиотека не знает конкретные сущности проекта. Проект расширяет типы:

```tsx
// В библиотеке: src/screens/types.ts

/**
 * Пустые интерфейсы - проект расширяет через module augmentation
 */
export interface EntityMap {}
export interface FixtureRefs {}

/**
 * ResolverContext использует EntityMap/FixtureRefs
 */
export interface ResolverContext {
  repo: <K extends keyof EntityMap>(entity: K) => EntityRepo<EntityMap[K]>
  ref: <A extends keyof FixtureRefs>(app: A, key: keyof FixtureRefs[A]) => string | undefined
  user: AuthUser | null
  appId: string
}

interface EntityRepo<T> {
  first: () => T | undefined
  get: (id: string) => T | undefined
  all: () => T[]
  find: (predicate: (item: T) => boolean) => T | undefined
}
```

```tsx
// В проекте: src/entities/types.ts

import type { Restaurant, Dish, Order, Courier } from './models'

// Module augmentation - расширяем типы библиотеки
declare module 'protomobilekit' {
  interface EntityMap {
    Restaurant: Restaurant
    Dish: Dish
    Order: Order
    Courier: Courier
  }

  interface FixtureRefs {
    customer: {
      defaultRestaurantId: string
      defaultOrderId: string
    }
    courier: {
      activeOrderId: string
    }
  }
}
```

### 1.3 Screen Definition

```tsx
/**
 * Полное определение экрана
 * Ключ в реестре: ${appId}:${navigatorId}:${name}
 */
export interface ScreenConfig<P = any, VM extends ViewModel = ViewModel> {
  /** ID приложения (namespace) */
  appId: string

  /** ID навигатора (default: 'main') */
  navigatorId?: string

  /** Имя экрана */
  name: string

  /** View компонент (только рендер) */
  View: React.ComponentType<{ vm: VM }>

  /** UseCase хук (логика + данные → ViewModel) */
  useCase: (params: P) => VM

  /** Резолвер параметров (возвращает Result) */
  resolveParams?: ParamsResolver<P>

  /**
   * Кодек для coercion параметров
   * Вызывается только если params пришли из URL (строки)
   * Если params из navigate() - уже типизированы, coercion не нужен
   */
  paramsCodec?: ParamsCodec<P>

  /** Теги для фильтрации в DevTools */
  tags?: string[]

  /** Описание для документации */
  description?: string
}

/**
 * Кодек для coercion параметров из URL
 */
export interface ParamsCodec<P> {
  /**
   * Coercion из unknown в типизированный объект
   * raw может быть Record<string,string> из URL или уже object из navigate()
   */
  coerce: (raw: Record<string, unknown>) => Partial<P>

  /** Сериализация в строки для URL */
  serialize: (params: P) => Record<string, string>
}
```

---

## 2. Единый реестр экранов

### 2.1 Ключ реестра

```tsx
// Ключ совпадает с существующим screenRegistry:
// ${appId}:${navigatorId}:${name}

function getScreenKey(appId: string, navigatorId: string, name: string): string {
  return `${appId}:${navigatorId}:${name}`
}
```

### 2.2 Расширенный ScreenEntry

```tsx
// src/canvas/screenRegistry.ts

export interface ScreenEntry {
  // Существующие поля (для обратной совместимости)
  name: string
  component: React.ComponentType<any>
  appId: string
  navigatorId: string
  label?: string

  // v2 поля
  View?: React.ComponentType<{ vm: any }>
  useCase?: (params: any) => any
  resolveParams?: ParamsResolver<any>
  paramsCodec?: ParamsCodec<any>
  tags?: string[]
  description?: string
}

/**
 * Регистрирует v2 экран
 */
export function registerScreenV2<P, VM>(config: ScreenConfig<P, VM>): void {
  const navigatorId = config.navigatorId ?? 'main'
  const key = getScreenKey(config.appId, navigatorId, config.name)

  screenRegistry.set(key, {
    name: config.name,
    appId: config.appId,
    navigatorId,
    component: () => null, // placeholder, не используется для v2

    // v2 поля
    View: config.View,
    useCase: config.useCase,
    resolveParams: config.resolveParams,
    paramsCodec: config.paramsCodec,
    tags: config.tags,
    description: config.description,
  })
}

/**
 * Проверяет, является ли экран v2
 */
export function isV2Screen(entry: ScreenEntry): boolean {
  return !!(entry.View && entry.useCase)
}
```

---

## 3. ScreenRenderer - единственное место пайплайна

Navigator всегда делегирует рендеринг в ScreenRenderer:

```tsx
// src/screens/ScreenRenderer.tsx

interface ScreenRendererProps {
  entry: ScreenEntry
  rawParams: Record<string, unknown>
  /** true если params пришли из URL/hash (нужен coercion) */
  fromUrl: boolean
}

export function ScreenRenderer({ entry, rawParams, fromUrl }: ScreenRendererProps) {
  const ctx = useResolverContext()

  // v2 экран
  if (isV2Screen(entry)) {
    return (
      <V2ScreenRenderer
        entry={entry}
        rawParams={rawParams}
        fromUrl={fromUrl}
        ctx={ctx}
      />
    )
  }

  // Legacy экран - просто рендерим component
  const Component = entry.component
  return <Component params={rawParams} />
}

function V2ScreenRenderer({
  entry,
  rawParams,
  fromUrl,
  ctx
}: {
  entry: ScreenEntry
  rawParams: Record<string, unknown>
  fromUrl: boolean
  ctx: ResolverContext
}) {
  // 1. Coerce params (только если из URL)
  const typedParams = (fromUrl && entry.paramsCodec)
    ? entry.paramsCodec.coerce(rawParams)
    : rawParams

  // 2. Resolve params
  const resolved = entry.resolveParams
    ? entry.resolveParams(typedParams, ctx)
    : { ok: true as const, params: typedParams }

  // 3. Error state
  if (!resolved.ok) {
    return <ScreenError reason={resolved.reason} debug={resolved.debug} />
  }

  // 4. useCase + View
  const vm = entry.useCase!(resolved.params)
  return <entry.View vm={vm} />
}
```

### 3.1 Интеграция с Navigator

```tsx
// В Navigator.tsx

// Определяем источник params
const fromUrl = useHash && typeof window !== 'undefined'

// Рендеринг текущего экрана
const screenEntry = getScreenEntry(appContext?.appId, id, currentRoute.name)

if (screenEntry) {
  return (
    <ScreenRenderer
      entry={screenEntry}
      rawParams={currentRoute.params}
      fromUrl={fromUrl}
    />
  )
}

// Fallback на inline component (если не в реестре)
return <Component params={currentRoute.params} navigation={contextValue} />
```

---

## 4. Fixtures - lifecycle и валидация

### 4.1 Порядок инициализации

```
1. defineEntity() - регистрация схем сущностей
2. seedData() - создание данных
3. setFixtureRefs() - регистрация refs (ПОСЛЕ seed!)
4. Первый рендер экранов
```

```tsx
// src/fixtures/store.ts

let fixtureRefs: FixtureRefs | null = null
let isSeeded = false

/**
 * Устанавливает fixture refs
 * ВАЖНО: вызывать только после seed данных!
 */
export function setFixtureRefs(refs: FixtureRefs): void {
  fixtureRefs = refs
  isSeeded = true
}

/**
 * Получает fixture ref
 */
export function getFixtureRef<A extends keyof FixtureRefs>(
  app: A,
  key: keyof FixtureRefs[A]
): string | undefined {
  if (!isSeeded) {
    console.warn('[FixtureRefs] Accessing refs before seed. Call setFixtureRefs() after seedData().')
  }
  return fixtureRefs?.[app]?.[key] as string | undefined
}

/**
 * Проверяет, готовы ли fixtures
 */
export function isFixturesReady(): boolean {
  return isSeeded
}
```

### 4.2 resolveParams с валидацией

```tsx
export function resolveRestaurantParams(
  given: Partial<RestaurantParams>,
  ctx: ResolverContext
): ResolveResult<RestaurantParams> {
  // Если ID передан - проверяем существование
  if (given.id) {
    const exists = ctx.repo('Restaurant').get(given.id)
    if (!exists) {
      return {
        ok: false,
        reason: `Restaurant "${given.id}" not found`,
        debug: {
          givenId: given.id,
          available: ctx.repo('Restaurant').all().map(r => ({ id: r.id, name: r.name }))
        }
      }
    }
    return { ok: true, params: { id: given.id } }
  }

  // Fallback на fixture ref
  const defaultId = ctx.ref('customer', 'defaultRestaurantId')

  if (!defaultId) {
    return {
      ok: false,
      reason: 'No restaurant ID provided and no default fixture configured',
      debug: {
        hint: 'Add defaultRestaurantId to fixtureRefs.customer',
        fixturesReady: isFixturesReady()
      }
    }
  }

  // Проверяем что fixture ref валиден
  const defaultRestaurant = ctx.repo('Restaurant').get(defaultId)
  if (!defaultRestaurant) {
    return {
      ok: false,
      reason: `Default restaurant fixture "${defaultId}" not found in data`,
      debug: {
        fixtureId: defaultId,
        hint: 'Fixture ref points to non-existent entity. Check seedData().'
      }
    }
  }

  return { ok: true, params: { id: defaultId } }
}
```

---

## 5. View/ViewModel с null-safety

ViewModel и View должны обрабатывать отсутствие данных:

### 5.1 ViewModel с nullable state

```tsx
export interface RestaurantVM {
  state: {
    restaurant: Restaurant | null  // может быть null!
    dishes: Dish[]
    loading: boolean
    error: string | null
  }
  actions: {
    orderDish: (dishId: string) => void
    goBack: () => void
    retry: () => void
  }
}
```

### 5.2 View с empty/error states

```tsx
export function RestaurantView({ vm }: { vm: RestaurantVM }) {
  const { state, actions } = vm

  // Loading state
  if (state.loading) {
    return (
      <Screen header={<Header title="Loading..." left={<BackButton onPress={actions.goBack} />} />}>
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      </Screen>
    )
  }

  // Error state
  if (state.error) {
    return (
      <Screen header={<Header title="Error" left={<BackButton onPress={actions.goBack} />} />}>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Text danger>{state.error}</Text>
          <Button onClick={actions.retry} className="mt-4">Retry</Button>
        </div>
      </Screen>
    )
  }

  // Empty state (данные удалены сценарием, например)
  if (!state.restaurant) {
    return (
      <Screen header={<Header title="Not Found" left={<BackButton onPress={actions.goBack} />} />}>
        <div className="flex-1 flex items-center justify-center">
          <Text secondary>Restaurant not available</Text>
        </div>
      </Screen>
    )
  }

  // Normal state
  return (
    <Screen
      header={
        <Header
          title={state.restaurant.name}
          left={<BackButton onPress={actions.goBack} />}
        />
      }
    >
      {/* ... */}
    </Screen>
  )
}
```

### 5.3 buildVM без assertion

```tsx
export function buildRestaurantVM(
  deps: RestaurantDeps,
  params: RestaurantParams,
  data: RestaurantData
): RestaurantVM {
  return {
    state: {
      restaurant: data.restaurant,  // null если не найден
      dishes: data.dishes,
      loading: data.loading,
      error: data.error
    },
    actions: {
      goBack: deps.goBack,

      orderDish: (dishId: string) => {
        // Guard: проверяем наличие данных
        if (!data.restaurant) return

        const dish = data.dishes.find(d => d.id === dishId)
        if (!dish) return

        deps.createOrder({
          customerId: deps.user?.id ?? 'anonymous',
          restaurantId: params.id,
          items: JSON.stringify([{ dishId, name: dish.name, qty: 1, price: dish.price }]),
          total: dish.price,
          status: 'pending'
        })

        deps.navigate('orderSuccess', { dishName: dish.name })
      },

      retry: () => {
        // Триггер перезагрузки данных
        deps.refetch?.()
      }
    }
  }
}
```

---

## 6. Сценарии - lifecycle

### 6.1 Типы

```tsx
export interface Scenario {
  id: string
  name: string
  appId: string
  screen: string
  navigatorId?: string

  paramsOverride?: (ctx: ResolverContext) => ResolveResult<any>
  setup?: (ctx: ScenarioContext) => CleanupFn
  description?: string
}

type CleanupFn = () => void

interface ScenarioContext extends ResolverContext {
  /** Патч сущности (откатится при cleanup) */
  patch: <K extends keyof EntityMap>(entity: K, id: string, changes: Partial<EntityMap[K]>) => void
  /** Добавить сущность (удалится при cleanup) */
  add: <K extends keyof EntityMap>(entity: K, data: EntityMap[K]) => void
  /** Удалить сущность (восстановится при cleanup) */
  remove: <K extends keyof EntityMap>(entity: K, id: string) => void
}
```

### 6.2 Lifecycle менеджер

```tsx
// src/scenarios/manager.ts

let currentScenario: { id: string; cleanup: CleanupFn | null } | null = null

/**
 * Активирует сценарий
 * Порядок: cleanup предыдущего → setup нового
 */
export function activateScenario(scenario: Scenario, ctx: ResolverContext): void {
  // 1. Cleanup предыдущего
  if (currentScenario?.cleanup) {
    currentScenario.cleanup()
  }

  // 2. Setup нового
  const scenarioCtx = createScenarioContext(ctx)
  const cleanup = scenario.setup?.(scenarioCtx) ?? null

  currentScenario = {
    id: scenario.id,
    cleanup
  }
}

/**
 * Деактивирует текущий сценарий
 * Вызывается при: смене сценария, выходе из экрана, размонте DevTools
 */
export function deactivateScenario(): void {
  if (currentScenario?.cleanup) {
    currentScenario.cleanup()
  }
  currentScenario = null
}

/**
 * Создаёт контекст с автоматическим cleanup tracking
 */
function createScenarioContext(baseCtx: ResolverContext): ScenarioContext {
  const patches: Array<{ entity: string; id: string; original: any }> = []
  const added: Array<{ entity: string; id: string }> = []
  const removed: Array<{ entity: string; data: any }> = []

  return {
    ...baseCtx,

    patch: (entity, id, changes) => {
      const original = baseCtx.repo(entity).get(id)
      if (original) {
        patches.push({ entity, id, original: { ...original } })
        // Apply patch...
      }
    },

    add: (entity, data) => {
      added.push({ entity, id: data.id })
      // Add to store...
    },

    remove: (entity, id) => {
      const data = baseCtx.repo(entity).get(id)
      if (data) {
        removed.push({ entity, data })
        // Remove from store...
      }
    },

    // Cleanup возвращается автоматически
    _getCleanup: () => () => {
      // Восстановить patched
      patches.forEach(({ entity, id, original }) => {
        // Restore original...
      })
      // Удалить added
      added.forEach(({ entity, id }) => {
        // Remove...
      })
      // Восстановить removed
      removed.forEach(({ entity, data }) => {
        // Re-add...
      })
    }
  }
}
```

### 6.3 Интеграция с DevTools

```tsx
// DevTools при смене сценария
function handleScenarioChange(scenario: Scenario | null) {
  if (scenario) {
    activateScenario(scenario, resolverContext)
  } else {
    deactivateScenario()
  }
}

// При размонте DevTools
useEffect(() => {
  return () => deactivateScenario()
}, [])
```

---

## 7. ParamsCodec - coercion

### 7.1 Базовые coercers

```tsx
// src/screens/coerce.ts

export const coerce = {
  string: (v: unknown): string | undefined =>
    typeof v === 'string' ? v : undefined,

  number: (v: unknown): number | undefined => {
    if (typeof v === 'number') return v
    if (typeof v === 'string') {
      const n = Number(v)
      return isNaN(n) ? undefined : n
    }
    return undefined
  },

  boolean: (v: unknown): boolean | undefined => {
    if (typeof v === 'boolean') return v
    if (v === 'true') return true
    if (v === 'false') return false
    return undefined
  },

  enum: <T extends string>(values: T[]) =>
    (v: unknown): T | undefined =>
      values.includes(v as T) ? (v as T) : undefined,

  json: <T>(v: unknown): T | undefined => {
    if (typeof v === 'object' && v !== null) return v as T
    if (typeof v === 'string') {
      try { return JSON.parse(v) }
      catch { return undefined }
    }
    return undefined
  }
}
```

### 7.2 Пример codec

```tsx
export interface OrderParams {
  id: string
  tab: 'info' | 'timeline' | 'chat'
  showDetails: boolean
}

export const orderParamsCodec: ParamsCodec<OrderParams> = {
  coerce: (raw) => ({
    id: coerce.string(raw.id),
    tab: coerce.enum(['info', 'timeline', 'chat'])(raw.tab),
    showDetails: coerce.boolean(raw.showDetails)
  }),

  serialize: (params) => ({
    id: params.id,
    tab: params.tab,
    showDetails: String(params.showDetails)
  })
}
```

---

## 8. Seed с fixture refs

```tsx
// src/entities/seed.ts

export function seedData() {
  const repo = getRepo

  // Создаём данные с известными ID
  const r1 = repo('Restaurant').create({
    id: 'r1',  // явный ID для предсказуемости
    name: 'Pizza Palace',
    cuisine: 'Italian',
    rating: 4.5,
  })

  const r2 = repo('Restaurant').create({
    id: 'r2',
    name: 'Sushi Master',
    cuisine: 'Japanese',
    rating: 4.8,
  })

  const o1 = repo('Order').create({
    id: 'o1',
    status: 'pending',
    restaurantId: r1.id,
    customerId: 'u1',
  })

  const o2 = repo('Order').create({
    id: 'o2',
    status: 'delivering',
    restaurantId: r2.id,
    customerId: 'u1',
    courierId: 'c1',
  })

  // Fixture refs - детерминированные ссылки
  setFixtureRefs({
    customer: {
      defaultRestaurantId: r1.id,
      defaultOrderId: o1.id,
    },
    courier: {
      activeOrderId: o2.id,
    }
  })
}
```

---

## 9. Полный пример экрана

```
src/apps/customer/screens/restaurant/
├── index.ts              # ScreenConfig + defineScreen
├── RestaurantView.tsx    # UI only
├── useRestaurantCase.ts  # Hook + buildVM
├── resolve.ts            # resolveParams
├── params.ts             # ParamsCodec
└── types.ts              # RestaurantParams, RestaurantVM
```

### index.ts

```tsx
import { defineScreen } from 'protomobilekit'
import { RestaurantView } from './RestaurantView'
import { useRestaurantCase } from './useRestaurantCase'
import { resolveRestaurantParams } from './resolve'
import { restaurantParamsCodec } from './params'

export const RestaurantScreen = defineScreen({
  appId: 'customer',
  navigatorId: 'main',
  name: 'restaurant',
  View: RestaurantView,
  useCase: useRestaurantCase,
  resolveParams: resolveRestaurantParams,
  paramsCodec: restaurantParamsCodec,
  tags: ['detail', 'restaurant'],
  description: 'Restaurant menu with dishes'
})
```

---

## 10. Миграция

### Шаг 1: Инфраструктура
- [ ] Добавить типы (ScreenConfig, ResolverContext, ResolveResult)
- [ ] Module augmentation для EntityMap/FixtureRefs
- [ ] Расширить ScreenEntry v2 полями
- [ ] Создать ScreenRenderer
- [ ] Fixtures store (setFixtureRefs, getFixtureRef)
- [ ] useResolverContext hook

### Шаг 2: Интеграция с Navigator
- [ ] Navigator делегирует в ScreenRenderer
- [ ] Передача fromUrl флага

### Шаг 3: Seed обновление
- [ ] seedData() вызывает setFixtureRefs()
- [ ] Явные ID в seed

### Шаг 4: Миграция экранов (постепенно)
- [ ] Начать с экранов с params (restaurant, orderDetails)
- [ ] Выделить View, useCase, resolveParams
- [ ] Остальные работают как legacy

---

## 11. Checklist архитектуры

- [x] Namespace по appId + navigatorId
- [x] Типобезопасный ResolverContext через module augmentation
- [x] ResolveResult с ok/error
- [x] Детерминированные fixture refs (ID, не функции выбора)
- [x] Единый реестр (расширение существующего)
- [x] ScreenRenderer как единственное место пайплайна
- [x] ParamsCodec с coercion (не только parse)
- [x] Сценарии с lifecycle (cleanup при смене/размонте)
- [x] View/ViewModel с null-safety
- [x] buildVM как pure function (без !)
- [x] Fixtures lifecycle (after seed, before render)
