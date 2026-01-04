import { useStore } from '../core/store'
import { generateFakeData, generateFakeRecords } from './faker'
import type { EntityDefinition, FieldsDefinition, InferEntity, InferEntityFromFields } from './types'
import type { Entity } from '../core/types'

// Entity registry
const entityRegistry: Map<string, EntityDefinition> = new Map()

/**
 * Define an entity schema with automatic type inference
 *
 * Usage:
 * ```ts
 * const User = entity({
 *   name: 'User',
 *   fields: {
 *     email: 'email',
 *     age: 'number',
 *     role: { type: 'enum', values: ['admin', 'user'] as const },
 *   }
 * })
 *
 * type User = InferEntity<typeof User>
 * // { id: string, email: string, age: number, role: 'admin' | 'user', ... }
 * ```
 */
export function entity<const F extends FieldsDefinition>(
  definition: EntityDefinition<F>
): EntityDefinition<F> & { _type: InferEntityFromFields<F> } {
  entityRegistry.set(definition.name, definition as EntityDefinition)
  return definition as EntityDefinition<F> & { _type: InferEntityFromFields<F> }
}

/**
 * Get entity definition by name
 */
export function getEntityDefinition(name: string): EntityDefinition | undefined {
  return entityRegistry.get(name)
}

/**
 * Get all entity definitions
 */
export function getEntityRegistry(): Map<string, EntityDefinition> {
  return entityRegistry
}

/**
 * Seed store with fake data for an entity
 */
export function seed<const F extends FieldsDefinition>(
  collectionOrDefinition: string | EntityDefinition<F>,
  count: number = 10
): InferEntityFromFields<F>[] {
  const store = useStore.getState()

  let collection: string
  let fields: FieldsDefinition
  let customMock: (() => Record<string, unknown>) | undefined

  if (typeof collectionOrDefinition === 'string') {
    const definition = entityRegistry.get(collectionOrDefinition)
    if (!definition) {
      throw new Error(`Entity "${collectionOrDefinition}" not found in registry`)
    }
    collection = definition.name
    fields = definition.fields
    customMock = definition.mock as (() => Record<string, unknown>) | undefined
  } else {
    collection = collectionOrDefinition.name
    fields = collectionOrDefinition.fields
    customMock = collectionOrDefinition.mock as (() => Record<string, unknown>) | undefined
  }

  const fakeRecords = generateFakeRecords(fields, count, customMock)
  const createdEntities: InferEntityFromFields<F>[] = []

  for (const record of fakeRecords) {
    const entity = store.create(collection, record as Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>)
    createdEntities.push(entity as InferEntityFromFields<F>)
  }

  return createdEntities
}

/**
 * Generate a single fake entity (without saving to store)
 */
export function fake<const F extends FieldsDefinition>(
  collectionOrDefinition: string | EntityDefinition<F>
): Omit<InferEntityFromFields<F>, 'id' | 'createdAt' | 'updatedAt'> {
  let fields: FieldsDefinition
  let customMock: (() => Record<string, unknown>) | undefined

  if (typeof collectionOrDefinition === 'string') {
    const definition = entityRegistry.get(collectionOrDefinition)
    if (!definition) {
      throw new Error(`Entity "${collectionOrDefinition}" not found in registry`)
    }
    fields = definition.fields
    customMock = definition.mock as (() => Record<string, unknown>) | undefined
  } else {
    fields = collectionOrDefinition.fields
    customMock = collectionOrDefinition.mock as (() => Record<string, unknown>) | undefined
  }

  const baseData = generateFakeData(fields)
  if (customMock) {
    return { ...baseData, ...customMock() } as Omit<InferEntityFromFields<F>, 'id' | 'createdAt' | 'updatedAt'>
  }
  return baseData as Omit<InferEntityFromFields<F>, 'id' | 'createdAt' | 'updatedAt'>
}

/**
 * Clear entity registry (useful for testing)
 */
export function clearEntityRegistry(): void {
  entityRegistry.clear()
}
