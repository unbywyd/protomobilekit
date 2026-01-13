import { faker } from '@faker-js/faker'
import type { FieldType, FieldDefinition, FieldsDefinition, PrimitiveFieldType, ArrayFieldDefinition } from './types'

// Generate fake value for a primitive field type
function generatePrimitiveValue(type: PrimitiveFieldType): unknown {
  switch (type) {
    case 'string':
      return faker.lorem.words(3)
    case 'number':
      return faker.number.int({ min: 1, max: 1000 })
    case 'boolean':
      return faker.datatype.boolean()
    case 'date':
      return faker.date.recent().getTime()
    case 'email':
      return faker.internet.email()
    case 'phone':
      return faker.phone.number()
    case 'url':
      return faker.internet.url()
    case 'image':
      return faker.image.url()
    case 'uuid':
      return faker.string.uuid()
    default:
      return null
  }
}

// Generate fake value for a field type
export function generateFakeValue(type: FieldType, definition?: FieldDefinition): unknown {
  // If custom faker path is provided
  if (definition && 'faker' in definition && definition.faker) {
    return getFakerValue(definition.faker)
  }

  switch (type) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'date':
    case 'email':
    case 'phone':
    case 'url':
    case 'image':
    case 'uuid':
      return generatePrimitiveValue(type)
    case 'enum':
      if (definition && 'values' in definition && definition.values.length > 0) {
        return faker.helpers.arrayElement(definition.values as readonly string[])
      }
      return ''
    case 'relation':
      // Relations should be set explicitly
      return null
    case 'array':
      if (definition && 'items' in definition) {
        const arrayDef = definition as ArrayFieldDefinition
        const minItems = arrayDef.minItems ?? 1
        const maxItems = arrayDef.maxItems ?? 5
        const count = faker.number.int({ min: minItems, max: maxItems })
        return Array.from({ length: count }, () => generatePrimitiveValue(arrayDef.items))
      }
      return []
    default:
      return null
  }
}

// Get faker value by path like "person.firstName"
function getFakerValue(path: string): unknown {
  const parts = path.split('.')
  let current: unknown = faker

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return null
    }
  }

  if (typeof current === 'function') {
    return current()
  }

  return current
}

// Generate fake data for all fields
export function generateFakeData(fields: FieldsDefinition): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, fieldDef] of Object.entries(fields)) {
    if (typeof fieldDef === 'string') {
      result[key] = generateFakeValue(fieldDef)
    } else {
      // Check if has default value
      if ('default' in fieldDef && fieldDef.default !== undefined) {
        result[key] = fieldDef.default
      } else {
        result[key] = generateFakeValue(fieldDef.type, fieldDef)
      }
    }
  }

  return result
}

// Generate multiple fake records
export function generateFakeRecords(
  fields: FieldsDefinition,
  count: number,
  customMock?: () => Record<string, unknown>
): Record<string, unknown>[] {
  return Array.from({ length: count }, () => {
    const baseData = generateFakeData(fields)
    if (customMock) {
      return { ...baseData, ...customMock() }
    }
    return baseData
  })
}
