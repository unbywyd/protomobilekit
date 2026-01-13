import type { Entity } from '../core/types'

// Primitive field types for entity schema
export type PrimitiveFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'phone'
  | 'url'
  | 'image'
  | 'uuid'

// All field types including special ones
export type FieldType =
  | PrimitiveFieldType
  | 'enum'
  | 'relation'
  | 'array'

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

export interface ArrayFieldDefinition<T extends PrimitiveFieldType = PrimitiveFieldType> {
  type: 'array'
  items: T
  required?: boolean
  default?: unknown[]
  /** Min items for faker */
  minItems?: number
  /** Max items for faker */
  maxItems?: number
  faker?: string
}

export interface BaseFieldDefinition {
  type: Exclude<FieldType, 'enum' | 'relation' | 'array'>
  required?: boolean
  default?: unknown
  faker?: string
}

export type FieldDefinition = BaseFieldDefinition | EnumFieldDefinition | RelationFieldDefinition | ArrayFieldDefinition

export type FieldsDefinition = Record<string, FieldType | FieldDefinition>

// Infer TypeScript type from primitive field type
type InferPrimitiveFieldType<T> =
  T extends 'string' | 'email' | 'phone' | 'url' | 'image' | 'uuid' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'date' ? number :
  unknown

// Infer TypeScript type from field type (including special types)
type InferFieldType<T> =
  T extends PrimitiveFieldType ? InferPrimitiveFieldType<T> :
  T extends 'enum' ? string :
  T extends 'relation' ? string | null :
  T extends 'array' ? unknown[] :
  unknown

// Infer type from any field definition
type InferField<F> =
  F extends EnumFieldDefinition<infer V> ? V[number] :
  F extends RelationFieldDefinition ? string | null :
  F extends ArrayFieldDefinition<infer T> ? InferPrimitiveFieldType<T>[] :
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
