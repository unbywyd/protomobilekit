import type { Entity } from '../core/types'

// Field types for entity schema
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'phone'
  | 'url'
  | 'image'
  | 'uuid'
  | 'enum'
  | 'relation'

export interface EnumFieldDefinition<V extends readonly string[] = readonly string[]> {
  type: 'enum'
  values: V
  required?: boolean
  default?: V[number]
  faker?: string
}

export interface RelationFieldDefinition {
  type: 'relation'
  collection: string
  required?: boolean
  default?: string | null
  faker?: string
}

export interface BaseFieldDefinition {
  type: Exclude<FieldType, 'enum' | 'relation'>
  required?: boolean
  default?: unknown
  faker?: string
}

export type FieldDefinition = BaseFieldDefinition | EnumFieldDefinition | RelationFieldDefinition

export type FieldsDefinition = Record<string, FieldType | FieldDefinition>

// Infer TypeScript type from field type
type InferFieldType<T> =
  T extends 'string' | 'email' | 'phone' | 'url' | 'image' | 'uuid' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'date' ? number :
  T extends 'enum' ? string :
  T extends 'relation' ? string | null :
  unknown

// Infer type from enum field with literal values
type InferEnumField<F extends EnumFieldDefinition> = F['values'][number]

// Infer type from any field definition
type InferField<F> =
  F extends EnumFieldDefinition<infer V> ? V[number] :
  F extends RelationFieldDefinition ? string | null :
  F extends BaseFieldDefinition ? InferFieldType<F['type']> :
  F extends FieldType ? InferFieldType<F> :
  unknown

// Infer entity type from fields definition
export type InferEntityFromFields<F extends FieldsDefinition> = Entity & {
  [K in keyof F]: InferField<F[K]>
}

// Entity definition with inferred type
export interface EntityDefinition<F extends FieldsDefinition = FieldsDefinition> {
  name: string
  fields: F
  mock?: () => Partial<Omit<InferEntityFromFields<F>, 'id' | 'createdAt' | 'updatedAt'>>
}

// Infer entity type from definition (using _type field added by entity())
export type InferEntity<D> = D extends { _type: infer T } ? T : never

// Registry of entity definitions
export type EntityRegistry = Record<string, EntityDefinition>
